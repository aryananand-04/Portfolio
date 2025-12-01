-- Sample metrics data
INSERT INTO metrics (metric_name, metric_value) VALUES
  ('years_experience', '2'),
  ('projects_completed', '5'),
  ('technologies', '10+')
ON CONFLICT (metric_name) DO NOTHING;

-- Sample project data
INSERT INTO projects (title, description, tech_stack, github_url, live_url, display_order) VALUES
  (
    'Portfolio Website',
    'Personal portfolio showcasing projects and skills',
    ARRAY['Next.js', 'TypeScript', 'Tailwind CSS', 'Vercel'],
    'https://github.com/yourusername/portfolio',
    'https://yourportfolio.vercel.app',
    1
  ),
  (
    'E-commerce Store',
    'Full-stack e-commerce platform with payment integration',
    ARRAY['React', 'Node.js', 'PostgreSQL', 'Stripe'],
    'https://github.com/yourusername/ecommerce',
    'https://demo.example.com',
    2
  )
ON CONFLICT DO NOTHING;
