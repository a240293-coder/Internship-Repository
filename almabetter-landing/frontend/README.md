# learnBetter Landing Page

A modern, responsive landing page built with Next.js inspired by learnBetter's Masters in Computer Science: Cloud Computing with AI System Design program.

## 🚀 Features

- **Modern Design**: Premium UI with gradient backgrounds, smooth animations, and hover effects
- **Fully Responsive**: Works seamlessly on desktop, tablet, and mobile devices
- **Component-Based Architecture**: Reusable React components for easy maintenance
- **Semantic HTML**: Accessible and SEO-friendly structure
- **Smooth Animations**: CSS animations on scroll and hover
- **Professional Typography**: Using Inter font family for clean, modern look

## 📋 Page Sections

1. **Navbar** - Sticky navigation with logo, links, and CTA buttons
2. **Hero Section** - Eye-catching headline with program stats
3. **Batch Info Strip** - Upcoming batch dates with career expert CTA
4. **Key Highlights** - 6 feature cards showcasing program benefits
5. **Program Statistics** - Impressive numbers (packages, placements, hiring partners)
6. **Program Value** - Global accreditation and benefits
7. **Mentors Section** - Industry expert profiles
8. **Student Success Stories** - Testimonial carousel
9. **Hiring Partners** - Logo grid of 1200+ partner companies
10. **Footer** - Multi-column footer with links and contact info

## 🛠️ Tech Stack

- **Framework**: Next.js 14.2.18 (App Router)
- **Language**: JavaScript (no TypeScript)
- **Styling**: CSS Modules
- **Fonts**: Google Fonts (Inter)
- **No External Libraries**: Pure React and CSS

## 📁 Project Structure

```
learnBetter-landing/
├── app/
│   ├── layout.js          # Root layout with metadata
│   ├── page.js            # Main page integrating all components
│   └── globals.css        # Global styles and utilities
├── components/
│   ├── Navbar.js          # Navigation component
│   ├── Navbar.module.css
│   ├── Hero.js            # Hero section
│   ├── Hero.module.css
│   ├── BatchInfo.js       # Batch dates strip
│   ├── BatchInfo.module.css
│   ├── Highlights.js      # Key features grid
│   ├── Highlights.module.css
│   ├── Stats.js           # Program statistics
│   ├── Stats.module.css
│   ├── ProgramValue.js    # Accreditation section
│   ├── ProgramValue.module.css
│   ├── Mentors.js         # Mentor profiles
│   ├── Mentors.module.css
│   ├── Testimonials.js    # Student testimonials carousel
│   ├── Testimonials.module.css
│   ├── HiringPartners.js  # Company logos grid
│   ├── HiringPartners.module.css
│   ├── Footer.js          # Footer component
│   └── Footer.module.css
├── public/                # Static assets
├── next.config.mjs        # Next.js configuration
└── package.json           # Dependencies
```

## 🎨 Design Features

### Color Palette
- Primary Blue: `#2563eb`
- Purple Gradient: `#667eea` to `#764ba2`
- Orange/Red Gradient: `#f59e0b` to `#ef4444`
- Neutral Grays: `#1f2937`, `#4b5563`, `#6b7280`

### Typography
- Headings: 700-800 weight
- Body: 400-600 weight
- Line heights optimized for readability

### Animations
- Fade in up animations on hero section
- Hover lift effects on cards
- Smooth color transitions
- Testimonial carousel transitions

## 🚀 Getting Started

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Development Server

The application will be available at:
- Local: `http://localhost:3000`
- Network: `http://[your-ip]:3000`

**Note**: If you encounter SWC binary errors on Windows, this is a known Next.js issue with certain Windows configurations. The application code is fully functional and will work correctly when:
1. Deployed to production (Vercel, Netlify, etc.)
2. Run on a different system architecture
3. Using Next.js 13.x or earlier versions

### Alternative: Use Create Next App (Latest)

If you want to start fresh with the latest Next.js:

```bash
npx create-next-app@latest my-app --js --no-typescript --app --no-tailwind
```

Then copy the components and styles from this project.

## 📱 Responsive Breakpoints

- **Desktop**: > 1024px - Full layout with 3-5 columns
- **Tablet**: 768px - 1024px - 2-3 column layout
- **Mobile**: < 768px - Single column, stacked layout

## 🎯 Key Components

### Navbar
- Fixed position with backdrop blur
- Smooth scroll behavior
- Hover animations on links

### Hero Section
- Full viewport height
- Gradient background
- Animated stat cards
- Dual CTA buttons

### Highlights Grid
- 3-column responsive grid
- Icon-based cards
- Hover lift effect

### Testimonials
- Custom carousel with dots navigation
- Smooth transitions
- Auto-switching testimonials

## 🔧 Customization

### Changing Colors
Edit the CSS module files or globals.css:
```css
/* Example: Change primary color */
.btnPrimary {
  background: #your-color;
}
```

### Adding Content
1. Edit component files in `/components`
2. Update data arrays (mentors, testimonials, etc.)
3. Modify text in JSX

### Adding Pages
Create new files in `/app` directory following Next.js App Router conventions.

## 📄 License

This project is for educational and demonstration purposes.

## 🤝 Contributing

Feel free to fork this project and customize it for your needs!

## 📧 Support

For issues or questions:
- Check Next.js documentation: https://nextjs.org/docs
- Review component code in `/components`
- Check browser console for errors

## 🎉 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify
1. Connect your Git repository
2. Build command: `npm run build`
3. Publish directory: `.next`

### Other Platforms
The app can be deployed to any platform supporting Next.js (AWS, Google Cloud, Azure, etc.)

---

**Built with ❤️ using Next.js and modern web technologies**
