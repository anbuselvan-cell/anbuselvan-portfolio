# Anbuselvan T: 3D Portfolio

React + Three.js frontend, Node.js + Express backend, MongoDB database.

```
portfolio/
  shared/portfolio.json   your content (one place to edit)
  client/                 React + Three.js (react-three-fiber)
  server/                 Express API + MongoDB
```

## Run it on your laptop

You need Node.js 18 or newer.

```bash
# 1. Backend
cd server
npm install
cp .env.example .env        # on Windows: copy .env.example .env
npm run dev                 # http://localhost:5000

# 2. Frontend (new terminal)
cd client
npm install
npm run dev                 # http://localhost:5173
```

Open http://localhost:5173. The small label in the top bar says **Live from backend** when the frontend is talking to the API.

## Use MongoDB

The site works without a database (file mode). To use MongoDB:

1. Create a free cluster at MongoDB Atlas and copy the connection string.
2. Put it in `server/.env` as `MONGODB_URI=...`.
3. Restart the server. It loads your content into the database the first time.
4. `npm run seed` resets the database from `shared/portfolio.json`.

What the backend does:

| Route | What it does |
| --- | --- |
| `GET /api/portfolio` | Sends your profile, projects, certificates and the rest to the frontend |
| `POST /api/contact` | Saves a message from the contact form (validated and rate limited) |
| `GET /api/messages` | Lists the saved messages. Needs the `x-admin-key` header set to `ADMIN_KEY` |
| `GET /api/health` | Shows whether the server is using `mongodb` or `file` mode |

## Change your content

Edit `shared/portfolio.json`. Photos and certificate images live in `client/src/assets/` and are matched by file name.

## Put it online (free)

1. **Database:** MongoDB Atlas.
2. **Backend:** Render. Root folder `server`, build command `npm install`, start command `npm start`. Add `MONGODB_URI`, `ADMIN_KEY` and `CLIENT_ORIGIN` as environment variables.
3. **Frontend:** Vercel or Netlify. Root folder `client`, build command `npm run build`, output `dist`. Add `VITE_API_URL` set to your Render address.
