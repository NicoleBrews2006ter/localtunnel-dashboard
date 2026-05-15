import express, { Express } from "express";
import { createTunnelsRouter } from "./tunnelsRoute";
import { createStatusRouter } from "./statusRoute";
import { createLogsRouter } from "./logsRoute";
import { createHealthRouter } from "./healthRoute";
import { createMetricsRouter } from "./metricsRoute";
import { createSnapshotRouter } from "./snapshotRoute";
import { createGroupsRouter } from "./groupsRoute";
import { createNotesRouter } from "./notesRoute";
import { TunnelStore } from "../tunnel/TunnelStore";
import { TunnelLogger } from "../tunnel/TunnelLogger";
import { TunnelNoteMap } from "../tunnel/TunnelNote";

export interface AppDependencies {
  store: TunnelStore;
  logger: TunnelLogger;
  noteMap?: TunnelNoteMap;
}

export function createApp(deps: AppDependencies): Express {
  const app = express();
  app.use(express.json());

  const noteMap: TunnelNoteMap = deps.noteMap ?? new Map();

  app.use("/tunnels", createTunnelsRouter(deps.store));
  app.use("/status", createStatusRouter(deps.store));
  app.use("/logs", createLogsRouter(deps.logger));
  app.use("/health", createHealthRouter(deps.store));
  app.use("/metrics", createMetricsRouter(deps.store));
  app.use("/snapshot", createSnapshotRouter(deps.store));
  app.use("/groups", createGroupsRouter(deps.store));
  app.use("/notes", createNotesRouter(noteMap));

  return app;
}
