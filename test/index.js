import { PlexAPIOAuth } from "../src/index.js";

const PlexSession = new PlexAPIOAuth();

PlexSession.GenerateClientId();

await PlexSession.PlexLogin();
