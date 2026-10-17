# UniqueVerse: setup and deploy (Cloudflare, free)

Follow the steps in order. Do not skip step 2 (Supabase).

## 1. Put the project on your computer
1. Extract this zip into a NEW folder, for example `C:\projects\uniqueverse-cloudflare`. Do not copy it over your old project.
2. Open that folder in VS Code, open the terminal, run: `npm install`

## 2. Supabase (about 10 minutes, one time)
1. **SQL (one file does everything):** Supabase > SQL Editor > New query. Open `supabase/all-in-one.sql` from this project, paste ALL of it, press Run. It creates every table, function and permission the site needs, never deletes data, and is safe to run again. (`admin.sql` and `accounts.sql` are the same file split in two; you do not need them if you ran `all-in-one.sql`.)
   After it runs, sign in to the admin and open **Overview**: the **Setup check** tells you in plain words if anything is still missing.
2. **Admin user:** Authentication > Users > Add user > Create new user.
   - Email: `uniqueinsaan1972@gmail.com`
   - Password: make a strong one (10+ characters) and keep it safe. Nobody else sees it.
   - Turn ON "Auto Confirm User". Press Create.
3. **Redirect links:** Authentication > URL Configuration.
   - Add to "Redirect URLs": `http://localhost:3000/auth/callback`
   - Later (after deploy) also add: `https://YOUR-SITE-URL/auth/callback`
   - Set "Site URL" to your site URL after deploy.
4. **Keys:** Project Settings > API Keys.
   - Publishable key (starts with `sb_publishable_`) goes in `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
   - Secret key (starts with `sb_secret_`) goes in `SUPABASE_SECRET_KEY`. Never share it.
5. **User sign-up emails (important):** Authentication > Sign In / Providers > Email.
   - Turn "Confirm email" OFF for now. Supabase's built-in email sender only works for your own team and only a few emails per hour, so with "Confirm email" ON real users could not finish signing up.
   - Later, when you add your own email service (SMTP, for example Brevo or Resend free plans), you can turn it ON again.
6. **2FA:** Authentication > Multi-Factor: make sure TOTP is enabled.

## 3. Your secrets file
Copy `.env.example` to `.env.local` and fill every line:
```
SUPABASE_URL=https://kxcynpuletbyjadfmdgt.supabase.co
SUPABASE_SECRET_KEY=sb_secret_...
ADMIN_EMAIL=uniqueinsaan1972@gmail.com
NEXT_PUBLIC_SUPABASE_URL=https://kxcynpuletbyjadfmdgt.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```
`.env.local` is never uploaded to GitHub (it is in .gitignore). Do not take screenshots of it.

## 4. Try it on your computer
`npm run dev`, then open `http://localhost:3000`.
- Check the home page, templates, create a website.
- Open `http://localhost:3000/admin`. It sends you to the sign-in page. Sign in with the admin email and password.
- Settings > Turn on 2FA (scan the QR with an authenticator app).

## 5. Deploy to Cloudflare (free plan)
1. Create a free account at dash.cloudflare.com.
2. In the terminal: `npx wrangler login` (a browser opens, press Allow).
3. Set `NEXT_PUBLIC_SITE_URL` in `.env.local` to your future address if you know it (you can change it later and deploy again).
4. Deploy: `npm run deploy`. At the end it prints your address, like `https://uniqueverse.YOURNAME.workers.dev`.
5. Add the 3 server secrets (each command asks you to paste the value, which is not shown):
```
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_SECRET_KEY
npx wrangler secret put ADMIN_EMAIL
```
6. Open your address. Add `https://YOUR-ADDRESS/auth/callback` to Supabase redirect URLs (step 2.3).
7. Sign in at `https://YOUR-ADDRESS/admin`.

Your old websites and photos stay: they live in Supabase, which this site uses too.

## 6. Accounts, tokens and money (how it works)
- Visitors browse and preview for free. To **generate** a website they must sign up (`/signup`) and sign in (`/login`).
- Each template has a price in tokens. 1 rupee = 1 token. Default price is 99 tokens. You can make any template **free** (price 0).
- If a user has too few tokens, the Generate window says so and has a **Top up tokens** button.
- On `/topup` the user picks tokens (99 to 9999 by default), sees the payment methods you set, pays, enters the amount sent, adds the screenshot and sends the request.
- You open **Admin > Payments**, look at the screenshot and your own Easypaisa/JazzCash app, then press **Approve** (tokens are added) or **Decline**. Approve can only be pressed once per request.
- If generating fails after the tokens were taken, they are returned automatically.
- Saving changes to a website that was already made is free.
- `/account` shows the profile (name, email, picture), token balance, the user's websites with link, QR and Edit QR, and the top-up history.

### First things to do in Admin after deploy
1. **Pricing:** add your payment methods (name, account holder, number) and check the default price, smallest and biggest top-up.
2. **Templates:** set a price for each (or press Free). Hide or delete the demo templates you do not want.
3. **Categories:** add or rename categories, then put each template in one.
4. **Coupons:** create percent or rupee coupons with a use limit and an end date.
5. Test the whole path with a second email: sign up, top up, approve it, generate.

## 7. Admin panel
- **Overview:** websites created, storage used.
- **Websites:** search, open, delete (also deletes its photos).
- **Templates:** edit name, description, category; hide; delete or restore. Websites already made keep working.
- **Home page:** change the main texts. Visitors see changes within about a minute.
- **Analytics:** page views, visitors, popular templates, generations, failures. Only counted from when you ran the SQL.
- **Settings:** change password, email yourself a reset link, 2FA.

## 8. If something goes wrong
- **Admin > Payments shows an error / Overview shows red "Setup check" items:** the message names the exact problem (a missing table, a wrong key, a different Supabase project in two settings). For missing tables, columns or functions, run `supabase/all-in-one.sql` and reload.
- **The page looks plain (no design, only black text):** stop the server (Ctrl+C), delete the `.next` folder, run `npm install` again, then `npm run dev`. If it is still plain, send a screenshot of the terminal.
- **Users cannot sign up / no email arrives:** check that "Confirm email" is OFF (step 2.5).
- **Cannot sign in / "not set up":** check `ADMIN_EMAIL` and the Supabase keys, then restart `npm run dev` or run `npm run deploy` again.
- **Lost your 2FA phone:** Supabase > Authentication > Users > your user > delete the factor.
- **Reset email does not arrive:** Supabase's built-in email is limited and may only send to your Supabase team members. Add your email as a team member, or set up your own SMTP later. You can always set a new password in Supabase > Authentication > Users.
- **"Generate" fails on Cloudflare with error 1102:** the free plan's CPU limit was hit. Options: Workers Paid ($5/month), or keep using your Vercel site.

## 9. Not done yet (so you know)
- Uploading a new template ZIP and creating templates from the admin panel.
- Automatic card payments (money is checked by you by hand), your own domain and AdSense.
- Tokens refund button (use Admin > Users to add tokens back by hand).
- Delete button for users (they ask by email for now).
