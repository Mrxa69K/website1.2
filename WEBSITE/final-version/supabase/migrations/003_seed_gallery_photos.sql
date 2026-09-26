-- Generated 41 rows from the static gallery pages.
-- One INSERT per photo; ON CONFLICT guards against re-running this twice.
-- Safe to run once, in the Supabase SQL Editor, after 002_alt_text_and_publish_log.sql.
--
-- What this does: brings every photo that was hand-placed in the
-- Proposal/Wedding/Portrait/Sport gallery pages into the `photos` table,
-- so the dashboard can fully manage them (edit/delete/reorder), same as
-- any photo added through the panel. The Event gallery had no static
-- photos to begin with (its #photoGallery container is empty in the
-- source), so there's nothing to seed there.
--
-- Many of these came in with generic repeated alt text ("Wedding
-- Photography Paris" on all 15 wedding photos, etc.) because that's
-- literally what was already live -- a good first thing to tidy up from
-- the dashboard's new alt-text field once this is running.

insert into photos (category, order_index, image_url, title, description, alt_text)
values
  ('proposal', 10, 'images/proposal/proposal2.webp', 'Proposal Photography Paris - Romantic Engagement Session', '', 'Proposal Photography Paris - Romantic Engagement Session'),
  ('proposal', 20, 'images/proposal/20.webp', 'Paris Proposal Photography - Eiffel Tower Engagement', '', 'Paris Proposal Photography - Eiffel Tower Engagement'),
  ('proposal', 30, 'images/proposal/4.webp', 'Marriage Proposal Paris - Professional Photography', '', 'Marriage Proposal Paris - Professional Photography'),
  ('proposal', 40, 'images/proposal/5.webp', 'Engagement Session Paris - Couple Photography', '', 'Engagement Session Paris - Couple Photography'),
  ('proposal', 50, 'images/proposal/proposal3.webp', 'Romantic Proposal Paris - Wedding Photography', '', 'Romantic Proposal Paris - Wedding Photography'),
  ('proposal', 60, 'images/proposal/6.webp', 'Paris Love Photography - Proposal Session', '', 'Paris Love Photography - Proposal Session'),
  ('proposal', 70, 'images/proposal/13.webp', 'Engagement Photography Paris - Professional Service', '', 'Engagement Photography Paris - Professional Service'),
  ('proposal', 80, 'images/proposal/14.webp', 'Marriage Proposal Photography - Paris Photographer', '', 'Marriage Proposal Photography - Paris Photographer'),
  ('proposal', 90, 'images/proposal/cute.webp', 'Couple Session Paris - Romantic Photography', '', 'Couple Session Paris - Romantic Photography'),
  ('proposal', 100, 'images/proposal/16.webp', 'Proposal Paris Photographer - Engagement Photos', '', 'Proposal Paris Photographer - Engagement Photos'),
  ('proposal', 110, 'images/proposal/21.webp', 'Paris Engagement Photography - Wedding Proposal', '', 'Paris Engagement Photography - Wedding Proposal'),
  ('proposal', 120, 'images/proposal/22.webp', 'Romantic Paris Photography - Proposal Session', '', 'Romantic Paris Photography - Proposal Session'),
  ('proposal', 130, 'images/proposal/23.webp', 'Marriage Proposal Paris - Professional Photographer', '', 'Marriage Proposal Paris - Professional Photographer'),
  ('proposal', 140, 'images/proposal/24.webp', 'Engagement Photos Paris - Couple Photography', '', 'Engagement Photos Paris - Couple Photography'),
  ('wedding', 10, 'images/wedding/018.webp', 'Wedding Photography Paris', '', 'Wedding Photography Paris'),
  ('wedding', 20, 'images/wedding/2.webp', 'Wedding Photography Paris', '', 'Wedding Photography Paris'),
  ('wedding', 30, 'images/wedding/02.webp', 'Wedding Photography Paris', '', 'Wedding Photography Paris'),
  ('wedding', 40, 'images/wedding/03.webp', 'Wedding Photography Paris', '', 'Wedding Photography Paris'),
  ('wedding', 50, 'images/wedding/010.webp', 'Wedding Photography Paris', '', 'Wedding Photography Paris'),
  ('wedding', 60, 'images/wedding/011.webp', 'Wedding Photography Paris', '', 'Wedding Photography Paris'),
  ('wedding', 70, 'images/wedding/012.webp', 'Wedding Photography Paris', '', 'Wedding Photography Paris'),
  ('wedding', 80, 'images/wedding/08.webp', 'Wedding Photography Paris', '', 'Wedding Photography Paris'),
  ('wedding', 90, 'images/wedding/09.webp', 'Wedding Photography Paris', '', 'Wedding Photography Paris'),
  ('wedding', 100, 'images/wedding/013.webp', 'Wedding Photography Paris', '', 'Wedding Photography Paris'),
  ('wedding', 110, 'images/wedding/014.webp', 'Wedding Photography Paris', '', 'Wedding Photography Paris'),
  ('wedding', 120, 'images/wedding/015.webp', 'Wedding Photography Paris', '', 'Wedding Photography Paris'),
  ('wedding', 130, 'images/wedding/016.webp', 'Wedding Photography Paris', '', 'Wedding Photography Paris'),
  ('wedding', 140, 'images/wedding/017.webp', 'Wedding Photography Paris', '', 'Wedding Photography Paris'),
  ('wedding', 150, 'images/wedding/019.webp', 'Wedding Photography Paris', '', 'Wedding Photography Paris'),
  ('portrait', 10, 'images/portrait/2p.webp', 'Professional Portrait Photography Paris', '', 'Professional Portrait Photography Paris'),
  ('portrait', 20, 'images/portrait/5p.webp', 'Professional Portrait Photography Paris', '', 'Professional Portrait Photography Paris'),
  ('portrait', 30, 'images/portrait/6p.webp', 'Professional Portrait Photography Paris', '', 'Professional Portrait Photography Paris'),
  ('sport', 10, 'images/sport/1.webp', 'Sports Photography Paris', '', 'Sports Photography Paris'),
  ('sport', 20, 'images/sport/10.webp', 'Sports Photography Paris', '', 'Sports Photography Paris'),
  ('sport', 30, 'images/sport/12.webp', 'Sports Photography Paris', '', 'Sports Photography Paris'),
  ('sport', 40, 'images/sport/13.webp', 'Sports Photography Paris', '', 'Sports Photography Paris'),
  ('sport', 50, 'images/sport/14.webp', 'Sports Photography Paris', '', 'Sports Photography Paris'),
  ('sport', 60, 'images/sport/2.webp', 'Sports Photography Paris', '', 'Sports Photography Paris'),
  ('sport', 70, 'images/sport/22.webp', 'Sports Photography Paris', '', 'Sports Photography Paris'),
  ('sport', 80, 'images/sport/5.webp', 'Sports Photography Paris', '', 'Sports Photography Paris'),
  ('sport', 90, 'images/sport/7.webp', 'Sports Photography Paris', '', 'Sports Photography Paris')
on conflict (image_url) do nothing;
