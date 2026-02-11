# Supabase Setup Guide for Portfolio Management

This guide will walk you through setting up Supabase for dynamic portfolio photo management.

## Prerequisites

- A Supabase account (free tier available at [supabase.com](https://supabase.com))
- Access to your project dashboard

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in your project details:
   - **Name**: Melissa Photography Portfolio
   - **Database Password**: Choose a strong password (save it securely)
   - **Region**: Choose closest to your users
4. Click "Create new project" and wait for setup to complete

## Step 2: Create Database Table

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the following SQL:

```sql
-- Create photos table
create table photos (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  image_url text not null,
  category text,
  order_index integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create index on category for faster queries
create index photos_category_idx on photos(category);

-- Create index on order_index for sorting
create index photos_order_idx on photos(order_index);
```

4. Click "Run" to execute the query

## Step 3: Set Up Storage Bucket

1. Go to **Storage** in the left sidebar
2. Click "Create a new bucket"
3. Enter bucket details:
   - **Name**: `photos`
   - **Public bucket**: Enable this option (toggle ON)
4. Click "Create bucket"

### Configure Storage Policies

1. Click on the `photos` bucket
2. Go to **Policies** tab
3. Click "New Policy" and add these policies:

**Policy 1: Public Read Access**
```sql
-- Allow public read access to photos
create policy "Public photos are viewable by everyone"
on storage.objects for select
using ( bucket_id = 'photos' );
```

**Policy 2: Authenticated Upload**
```sql
-- Allow authenticated users to upload photos
create policy "Authenticated users can upload photos"
on storage.objects for insert
with check ( bucket_id = 'photos' AND auth.role() = 'authenticated' );
```

**Policy 3: Authenticated Update**
```sql
-- Allow authenticated users to update photos
create policy "Authenticated users can update photos"
on storage.objects for update
using ( bucket_id = 'photos' AND auth.role() = 'authenticated' );
```

**Policy 4: Authenticated Delete**
```sql
-- Allow authenticated users to delete photos
create policy "Authenticated users can delete photos"
on storage.objects for delete
using ( bucket_id = 'photos' AND auth.role() = 'authenticated' );
```

## Step 4: Configure Row Level Security (RLS)

1. Go back to **Table Editor**
2. Select the `photos` table
3. Click on the **RLS** tab or go to **Authentication > Policies**
4. Enable RLS for the `photos` table
5. Add the following policies:

### SQL for Table Policies

Go to **SQL Editor** and run:

```sql
-- Enable Row Level Security
alter table photos enable row level security;

-- Policy: Everyone can view photos
create policy "Photos are viewable by everyone"
on photos for select
using ( true );

-- Policy: Authenticated users can insert photos
create policy "Authenticated users can insert photos"
on photos for insert
with check ( auth.role() = 'authenticated' );

-- Policy: Authenticated users can update photos
create policy "Authenticated users can update photos"
on photos for update
using ( auth.role() = 'authenticated' );

-- Policy: Authenticated users can delete photos
create policy "Authenticated users can delete photos"
on photos for delete
using ( auth.role() = 'authenticated' );
```

## Step 5: Create Admin User

1. Go to **Authentication** > **Users**
2. Click "Add user" > "Create new user"
3. Fill in admin credentials:
   - **Email**: your-admin-email@example.com
   - **Password**: Choose a strong password
   - **Auto Confirm User**: Enable this option
4. Click "Create user"

## Step 6: Update Configuration Files

The configuration is already set in `js/supabase-config.js` with these values:

```javascript
const SUPABASE_CONFIG = {
    url: 'https://yspjuakdfukoawjjiulb.supabase.co',
    anonKey: 'sb_publishable_7F_MmEp9qZtlYIF8imba4g_1KrhBzga'
};
```

**Note**: If you need to update these values:
1. Go to **Settings** > **API** in your Supabase dashboard
2. Copy your **Project URL** and **anon public** key
3. Update the values in `js/supabase-config.js`

## Step 7: Test the Setup

### Test Admin Panel

1. Open `admin.html` in your browser
2. Log in with your admin credentials
3. Try uploading a test photo:
   - Select an image file
   - Enter a title
   - Choose a category (proposal, wedding, portrait, event, or sport)
   - Set an order index (lower numbers appear first)
   - Click "Save Photo"
4. The photo should appear in the "Existing Photos" grid below

### Test Portfolio Pages

1. Open one of the portfolio pages (e.g., `proposal.html`)
2. The page should automatically load photos from Supabase
3. If no photos exist for that category, you'll see "No photos available"
4. Upload some photos through the admin panel and refresh the page

## Troubleshooting

### Issue: "Error loading photos"

**Solution**: Check the browser console for detailed error messages:
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Look for errors related to Supabase

Common causes:
- Incorrect API credentials in `supabase-config.js`
- RLS policies not set up correctly
- Network connectivity issues

### Issue: "Error uploading image"

**Solutions**:
- Verify the storage bucket is set to **Public**
- Check that storage policies are created correctly
- Ensure the bucket name is `photos` (case-sensitive)

### Issue: Login fails

**Solutions**:
- Verify admin user was created in Authentication panel
- Check that "Auto Confirm User" was enabled
- Try resetting the password in the Supabase dashboard

### Issue: Photos don't appear on portfolio pages

**Solutions**:
- Verify photos are uploaded with the correct category
- Check that RLS policies allow public SELECT
- Ensure `data-category` attribute matches the category in database
- Open browser console to check for JavaScript errors

## Database Schema Reference

### Photos Table Structure

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key (auto-generated) |
| `title` | text | Photo title (required) |
| `description` | text | Photo description (optional) |
| `image_url` | text | URL to image in storage (required) |
| `category` | text | Category: proposal, wedding, portrait, event, sport |
| `order_index` | integer | Display order (lower = first, default: 0) |
| `created_at` | timestamp | Creation timestamp (auto) |
| `updated_at` | timestamp | Last update timestamp (auto) |

### Valid Categories

- `proposal` - Engagement and proposal photos
- `wedding` - Wedding photography
- `portrait` - Portrait sessions
- `event` - Event photography
- `sport` - Sports photography

## Features

### Admin Panel Features

✅ **Secure Authentication**: Login with Supabase Auth
✅ **Photo Upload**: Upload images directly to Supabase Storage
✅ **CRUD Operations**: Create, Read, Update, Delete photos
✅ **Image Preview**: Preview images before uploading
✅ **Category Management**: Organize photos by category
✅ **Custom Ordering**: Control photo display order with order_index
✅ **Responsive Design**: Works on desktop and mobile

### Portfolio Page Features

✅ **Dynamic Loading**: Photos load automatically from database
✅ **Category Filtering**: Each page shows only relevant category
✅ **Lightbox Gallery**: Click photos for full-screen view
✅ **AOS Animations**: Smooth fade-in effects
✅ **Lazy Loading**: Images load as user scrolls
✅ **Fallback Messages**: Friendly message when no photos exist

## Security Notes

⚠️ **Important Security Considerations**:

1. **Keep Admin Credentials Secure**: Never share your admin email and password
2. **Anon Key is Safe**: The `anonKey` in the config is meant to be public
3. **RLS Protects Data**: Row Level Security ensures only authenticated users can modify data
4. **HTTPS Only**: Always use HTTPS in production
5. **Regular Backups**: Set up regular database backups in Supabase

## Maintenance

### Regular Tasks

1. **Backup Database**: Use Supabase's backup features regularly
2. **Monitor Storage**: Check storage usage in Supabase dashboard
3. **Update Photos**: Keep portfolio fresh with new photos
4. **Review Order**: Adjust `order_index` to feature best photos first

### Adding New Categories

If you want to add new portfolio categories:

1. Add the category option in `admin.html`:
```html
<option value="newcategory">New Category</option>
```

2. Create a new portfolio page (e.g., `newcategory.html`)
3. Add `data-category="newcategory"` to the body tag
4. Include the Supabase scripts before `</body>`
5. Add `<div id="photoGallery" class="row"></div>` in the content area

## Support

For issues with Supabase:
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Community](https://github.com/supabase/supabase/discussions)

For issues with this implementation:
- Check browser console for errors
- Verify all setup steps were completed
- Review RLS policies in Supabase dashboard
