# localtunnel-dashboard

A minimal web UI for monitoring and managing multiple localtunnel sessions simultaneously.

## Installation

```bash
npm install -g localtunnel-dashboard
```

## Usage

Start the dashboard and begin adding tunnels through the web interface:

```bash
ltdash --port 4000
```

Then open your browser at `http://localhost:4000`.

You can also pass an initial set of tunnels via a config file:

```bash
ltdash --config tunnels.json
```

**Example `tunnels.json`:**

```json
[
  { "name": "api", "localPort": 3000 },
  { "name": "frontend", "localPort": 5173 }
]
```

The dashboard will display each tunnel's public URL, connection status, and request activity in real time. Tunnels can be started, stopped, and restarted directly from the UI.

## Requirements

- Node.js 18+
- [localtunnel](https://github.com/localtunnel/localtunnel) (`npm install -g localtunnel`)

## Development

```bash
git clone https://github.com/your-username/localtunnel-dashboard.git
cd localtunnel-dashboard
npm install
npm run dev
```

## Contributing

Pull requests are welcome. Please open an issue first to discuss any significant changes.

## License

[MIT](LICENSE)