
import { createPiece, PieceAuth } from "@activepieces/pieces-framework";
import {fetchTopStories} from "./lib/actions/fetch-top-stories";

export const hackerNews = createPiece({
  displayName: "Hacker-news Tutorial",
  auth: PieceAuth.None(),
  minimumSupportedRelease: '0.8.0',
  logoUrl: "https://cdn.activepieces.com/pieces/hacker-news.png",
  authors: [],
  actions: [fetchTopStories],
  triggers: [],
});
