import { ProjectSchema } from './Project.schema';
import { projectMock } from '../../Client/__mock__/projectMock';

describe('ProjectSchema variants', () => {
  it('keeps the designer\'s names, which the export publishes in gx-variants.json', () => {
    const variants = {
      dimensions: [{
        id: 'occasion',
        name: 'Occasion',
        values: ['performance', 'everyday-wellness'],
        valueNames: { performance: 'Performance', 'everyday-wellness': 'Everyday Wellness' }
      }]
    };
    expect(ProjectSchema.parse({ ...projectMock, variants }).variants).toEqual(variants);
  });

  it('reads the ids-only shape an older public API sends', () => {
    const variants = { dimensions: [{ id: 'occasion', values: ['performance'] }] };
    expect(ProjectSchema.parse({ ...projectMock, variants }).variants).toEqual(variants);
  });
});
