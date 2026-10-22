export class Writer {
  private data: Uint8Array;
  private idx: number;
  private size: number;

  constructor(size: number) {
    this.data = new Uint8Array(size);
    this.idx = 0;
    this.size = size;
  }

  getData() {
    if (this.idx !== this.size) throw new Error('Mismatch between size reserved and sized used');
    return this.data.slice(0, this.idx);
  }

  writeUint8(value: number) {
    this.data.set([value], this.idx);
    this.idx += 1;
  }

  writeUint16(value: number) {
    const arr = new Uint16Array(1);
    arr[0] = value;
    const buffer = new Uint8Array(arr.buffer);
    this.data.set([buffer[1], buffer[0]], this.idx);
    this.idx += 2;
  }

  writeUint8Array(value: Uint8Array) {
    this.data.set(value, this.idx);
    this.idx += value.length;
  }
}

interface AVCCBox {
  configurationVersion: number;
  AVCProfileIndication: number;
  profile_compatibility: number;
  AVCLevelIndication: number;
  lengthSizeMinusOne: number;
  nb_SPS_nalus: number;
  SPS: { length: number; nalu: Uint8Array }[];
  nb_PPS_nalus: number;
  PPS: { length: number; nalu: Uint8Array }[];
}

const getExtradata = (avccBox: AVCCBox) => {
  let i;
  let size = 7;
  for (i = 0; i < avccBox.SPS.length; i += 1) {
    // nalu length is encoded as a uint16.
    size += 2 + avccBox.SPS[i].length;
  }
  for (i = 0; i < avccBox.PPS.length; i += 1) {
    // nalu length is encoded as a uint16.
    size += 2 + avccBox.PPS[i].length;
  }
  const writer = new Writer(size);
  writer.writeUint8(avccBox.configurationVersion);
  writer.writeUint8(avccBox.AVCProfileIndication);
  writer.writeUint8(avccBox.profile_compatibility);
  writer.writeUint8(avccBox.AVCLevelIndication);
  writer.writeUint8(avccBox.lengthSizeMinusOne + (63 << 2));
  writer.writeUint8(avccBox.nb_SPS_nalus + (7 << 5));
  for (i = 0; i < avccBox.SPS.length; i += 1) {
    writer.writeUint16(avccBox.SPS[i].length);
    writer.writeUint8Array(avccBox.SPS[i].nalu);
  }
  writer.writeUint8(avccBox.nb_PPS_nalus);
  for (i = 0; i < avccBox.PPS.length; i += 1) {
    writer.writeUint16(avccBox.PPS[i].length);
    writer.writeUint8Array(avccBox.PPS[i].nalu);
  }
  return writer.getData();
};

const INVALID_MP4 = 'URL provided is not a valid mp4 video file.';

const fetchBody = async (src: string, signal: AbortSignal): Promise<ReadableStream<Uint8Array>> => {
  const res = await fetch(src, { signal });
  if (!res.ok || !res.body) throw new Error(`Failed to fetch ${src}: HTTP ${res.status}`);
  return res.body;
};

const aborted = (signal: AbortSignal) => new Promise<never>((_, reject) => {
  if (signal.aborted) {
    reject(signal.reason);
    return;
  }
  signal.addEventListener('abort', () => reject(signal.reason), { once: true });
});

const decodeVideo = async (
  src: string,
  emitFrame: (bitmap: ImageBitmap) => void,
  { VideoDecoder, EncodedVideoChunk, debug }: any
): Promise<void> => {
  if (debug) console.info('Decoding video from', src);
  const controller = new AbortController();
  const { signal } = controller;
  const fail = (error: unknown) => controller.abort(error);
  const bitmaps: Promise<void>[] = [];
  let configured = false;
  const decoder = new VideoDecoder({
    output: (frame: VideoFrame) => {
      bitmaps.push(
        createImageBitmap(frame, { resizeQuality: 'low' })
          .then((bitmap) => {
            if (signal.aborted) bitmap.close();
            else emitFrame(bitmap);
          })
          .catch(fail)
          .finally(() => frame.close())
      );
    },
    error: (error: unknown) => {
      console.error(error);
      fail(error);
    },
  });

  try {
    const [MP4Box, stream] = await Promise.all([import('mp4box'), fetchBody(src, signal)]);
    const mp4boxfile = MP4Box.createFile();
    mp4boxfile.onError = fail;

    mp4boxfile.onReady = (info: any) => {
      try {
        const track = info?.videoTracks?.[0];
        if (!track) throw new Error(INVALID_MP4);
        if (debug) console.info('Video with codec:', track.codec);
        const avccBox = mp4boxfile.getTrackById(track.id)?.mdia.minf.stbl.stsd.entries[0]?.avcC;
        if (!avccBox) throw new Error(`Unsupported codec ${track.codec}: only H.264 video can be decoded.`);
        decoder.configure({ codec: track.codec, description: getExtradata(avccBox) });
        configured = true;
        mp4boxfile.setExtractionOptions(track.id);
        mp4boxfile.start();
      } catch (error) {
        fail(error);
      }
    };

    mp4boxfile.onSamples = (_trackId: number, _ref: unknown, samples: any[]) => {
      try {
        for (const sample of samples) {
          decoder.decode(new EncodedVideoChunk({
            type: sample.is_sync ? 'key' : 'delta',
            timestamp: sample.cts,
            duration: sample.duration,
            data: sample.data,
          }));
        }
      } catch (error) {
        fail(error);
      }
    };

    const decodeStream = async () => {
      const reader = stream.getReader();
      let offset = 0;
      for (let chunk = await reader.read(); !chunk.done; chunk = await reader.read()) {
        if (signal.aborted) return;
        const buffer = chunk.value.buffer as ArrayBuffer & { fileStart: number };
        buffer.fileStart = offset;
        offset += buffer.byteLength;
        mp4boxfile.appendBuffer(buffer);
      }
      mp4boxfile.flush();
      if (!configured) throw new Error(INVALID_MP4);
      await decoder.flush();
      await Promise.all(bitmaps);
    };

    await Promise.race([decodeStream(), aborted(signal)]);
  } catch (error) {
    fail(error);
    throw signal.reason;
  } finally {
    if (decoder.state !== 'closed') decoder.close();
  }
};


export default ( src: string, emitFrame: (bitmap: ImageBitmap) => void, debug: boolean): Promise<void> => {
  if (typeof VideoDecoder === 'function' && typeof EncodedVideoChunk === 'function') {
    if (debug)
      console.info('WebCodecs is natively supported, using native version...');
    return decodeVideo(src, emitFrame, {
      VideoDecoder,
      EncodedVideoChunk,
      debug,
    });
  }
  if (debug) console.info('WebCodecs is not available in this browser.');
  return Promise.resolve();
};
