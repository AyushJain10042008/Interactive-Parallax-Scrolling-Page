# Ascend: a parallax scrolling journey

A scroll-driven parallax page that takes you from a mountain sunrise, up through the clouds, to the edge of space. Built with plain HTML, CSS and JavaScript. No libraries, no build step, no image files.

## What's in it

- **Layered depth.** Mountains, mist, clouds, stars, planets and a rocket all move at different speeds as you scroll.
- **Smooth motion.** Scroll position is eased in JavaScript, and only sections near the screen are updated.
- **Mouse parallax** on the sunrise mountains (desktop).
- **Live altitude readout, progress bar and section dots** that follow your scroll.
- **Responsive** down to phone width, and it respects the "reduce motion" setting.

## Files

| File | Purpose |
|---|---|
| `index.html` | Page structure: five sections, each made of layers |
| `style.css` | Layout, colours, gradients and the shapes (sun, planet, moon, clouds) |
| `script.js` | The parallax engine |

## Run it locally

Open `index.html` in a browser. That's it.

## Put it online with GitHub Pages

1. Create a new repository on GitHub (for example `ascend-parallax`) and make it **Public**.
2. Click **Add file > Upload files**, drag in `index.html`, `style.css`, `script.js` and `README.md`, then **Commit changes**.
3. Go to **Settings > Pages**.
4. Under **Build and deployment**, set **Source** to **Deploy from a branch**, choose the **main** branch and the **/ (root)** folder, then **Save**.
5. Wait a minute or two. Your link will be `https://YOUR-USERNAME.github.io/ascend-parallax/`.

Submit that link along with the repository URL.

## How the parallax works

Any element with a `data-speed` attribute is a parallax layer:

```html
<div class="layer sun" data-speed=".55"></div>
```

| `data-speed` | Effect |
|---|---|
| `0` | Scrolls with the page |
| positive (`.1` to `.5`) | Moves slower than the page, so it looks far away |
| negative (`-.1` to `-.5`) | Moves faster than the page, so it looks close |

Optional attributes: `data-x` adds sideways drift, and `data-fade` fades the element out as it leaves the screen.

For each section, `script.js` measures how far the section's centre is from the screen's centre, then shifts each layer by `-offset × speed`. Try changing a few speeds and watch the depth change.

## Make it your own

- Change the headline and copy in `index.html`.
- Edit the section gradients and mountain colours at the top of each section in `style.css`.
- Add your name and course details to the footer.
