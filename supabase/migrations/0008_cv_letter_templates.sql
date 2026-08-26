-- ============================================================
-- PortoTional migration 0008 — PRD v3 Phase 3:
-- Letter page size + CV template catalog expansion
-- ============================================================

alter table public.resumes drop constraint if exists resumes_page_size_check;
alter table public.resumes
  add constraint resumes_page_size_check
  check (page_size in ('A4','F4','LETTER'));

-- §10 template categories — structurally distinct set (engine consumes config)
insert into public.templates (type, name, slug, description, configuration, is_premium) values
('cv', 'Two-Column Modern', 'two-column-modern',
 'Sidebar for skills/contact, main column for experience. Tech-friendly.',
 '{"accent":"#2563EB","serif":false,"layout":"two-column","photoPosition":"sidebar-top","sectionsDefaultOrder":["summary","experience","education","skills","projects","certifications"]}', false),
('cv', 'Academic Serif', 'academic-serif',
 'Classic academic layout emphasising education and publications.',
 '{"accent":"#0B0C10","serif":true,"layout":"single","dense":true,"photoPosition":"none","sectionsDefaultOrder":["summary","education","experience","projects","skills","certifications"]}', false),
('cv', 'Creative Bold', 'creative-bold',
 'High-contrast creative layout with large name treatment.',
 '{"accent":"#D4AF37","serif":false,"layout":"single","largeHeader":true,"photoPosition":"header-right","sectionsDefaultOrder":["summary","projects","experience","skills","education","certifications"]}', true),
('cv', 'Student Compact', 'student-compact',
 'One-page focused layout for students and first-job seekers.',
 '{"accent":"#16A34A","serif":false,"layout":"single","compact":true,"photoPosition":"none","sectionsDefaultOrder":["summary","education","projects","skills","experience","certifications"]}', false),
('cv', 'Developer Tech', 'developer-tech',
 'Monospace accents and project-first ordering for engineers.',
 '{"accent":"#0EA5E9","serif":false,"mono":true,"layout":"single","photoPosition":"none","sectionsDefaultOrder":["summary","skills","projects","experience","education","certifications"]}', false)
on conflict (slug) do nothing;
