// Visual-only template catalog for the marketing teaser and the "New resume" gallery.
// The backend only supports two starter documents (`blank` / `simple` — see
// CreateResumeDialog's `createResumeSchema`), so each card maps to whichever starter
// is the closer real match. Adding real per-template LaTeX content is a backend change,
// out of scope for this UI pass.
export interface TemplateOption {
  name: string
  description: string
  tag: string
  starter: 'blank' | 'simple'
}

export const TEMPLATES: TemplateOption[] = [
  {
    name: 'Modern Professional',
    description: 'Clean two-column layout with a bold header band.',
    tag: 'Most used',
    starter: 'simple',
  },
  {
    name: 'Software Engineer',
    description: 'Optimized for tech stacks, projects, and metrics-driven bullets.',
    tag: 'Popular',
    starter: 'simple',
  },
  {
    name: 'Minimal',
    description: 'Just the essentials — generous whitespace, no ornamentation.',
    tag: 'Minimal',
    starter: 'blank',
  },
  {
    name: 'Executive',
    description: 'Formal serif styling suited for senior leadership roles.',
    tag: 'Senior',
    starter: 'simple',
  },
  {
    name: 'ATS Optimized',
    description: 'Single-column, parser-safe structure that scans cleanly.',
    tag: 'ATS safe',
    starter: 'simple',
  },
  {
    name: 'Academic CV',
    description: 'Publications, research, and teaching sections built in.',
    tag: 'Academic',
    starter: 'simple',
  },
  {
    name: 'Creative Designer',
    description: 'A touch of color and typographic personality.',
    tag: 'Creative',
    starter: 'simple',
  },
  {
    name: 'Product Manager',
    description: 'Impact-first layout built around outcomes and roadmaps.',
    tag: 'PM',
    starter: 'simple',
  },
  {
    name: 'Data Scientist',
    description: 'Room for tools, models, and publications side by side.',
    tag: 'Technical',
    starter: 'simple',
  },
  {
    name: 'Research',
    description: 'Structured for grants, papers, and lab experience.',
    tag: 'Research',
    starter: 'simple',
  },
  {
    name: 'Business Analyst',
    description: 'Balanced layout for metrics, tools, and case studies.',
    tag: 'Analyst',
    starter: 'simple',
  },
  {
    name: 'Startup Founder',
    description: 'Lead with traction and ownership over job titles.',
    tag: 'Founder',
    starter: 'blank',
  },
]
