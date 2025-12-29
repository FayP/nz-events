# Deploy Sanity Studio Online

## Quick Deploy

1. **Login to Sanity CLI:**
   ```bash
   npx sanity login
   ```
   This will open your browser to authenticate.

2. **Deploy Studio:**
   ```bash
   npm run sanity:deploy
   ```

3. **Access Your Studio:**
   After deployment, your studio will be available at:
   ```
   https://jsiwg6tc.sanity.studio
   ```

## Alternative: Access via Sanity Dashboard

If you don't want to deploy the studio, you can access your content via the Sanity Dashboard:

1. Go to https://sanity.io/manage
2. Sign in to your account
3. Select your project (jsiwg6tc)
4. Click on **"Content"** or **"Studio"** tab
5. Your events will be visible there

## Verify Events Are There

Your events are already in Sanity (we synced them). You can verify:

1. **Via API:**
   ```bash
   # Test query
   curl "https://jsiwg6tc.api.sanity.io/v2024-01-01/data/query/production?query=*[_type == \"event\"]"
   ```

2. **Via Dashboard:**
   - Go to https://sanity.io/manage
   - Select your project
   - Check the "Content" section

3. **Via Local Studio:**
   ```bash
   npm run sanity:dev
   ```
   Opens at http://localhost:3333

## Troubleshooting

### "You must login first"
Run: `npx sanity login`

### "Studio not found" (404)
The studio needs to be deployed first. Run `npm run sanity:deploy` after logging in.

### Can't see events in dashboard
- Make sure you're looking at the correct project
- Check the dataset (should be "production")
- Events are in the "event" document type

## Notes

- **Data is already there**: The sync we ran wrote directly to your Sanity project
- **Studio is just the UI**: Deploying the studio makes the editing interface available online
- **You can edit without deploying**: Use the Sanity Dashboard or local studio

