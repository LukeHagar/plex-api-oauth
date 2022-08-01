import { strict as assert } from "assert";
import {
  CreatePlexClientInformation,
  PlexLogin,
  GetPlexUserData,
} from "../src/index.js";
import React from "React";

describe("Unit Tests", function () {
  let emptyArray = [];
  it("Generate ClientId and Login", async function () {
    this.timeout(10000);
    let plexSession = await PlexLogin(plexClientInformation);
    assert.notEqual(plexSession.plexTVAuthToken, null);
    assert.notEqual(plexSession.plexTVAuthToken, undefined);
    assert.notEqual(plexSession.plexClientInformation, null);
    assert.notEqual(plexSession.plexClientInformation, undefined);
    console.log("Client Info and Auth Token");
    console.log(plexSession);
  });
  it("Get Plex User Data", async function () {
    this.timeout(5000);
    let plexSession = await PlexLogin(plexClientInformation);
    let plexTVUserData = await GetPlexUserData(plexSession);
    assert.notEqual(plexTVUserData, undefined);
    assert.notEqual(plexTVUserData, null);
    console.log("User Data");
    console.log(plexTVUserData);
  });
  it("Get Plex Servers", async function () {
    this.timeout(12000);
    let plexSession = await PlexLogin(plexClientInformation);
    let plexTVUserData = await GetPlexUserData(plexSession);
    let plexServers = await PlexSession.GetPlexServers(plexSession);
    assert.notEqual(plexServers, emptyArray);
    assert.notEqual(plexServers, null);
    assert.notEqual(plexServers, undefined);
    console.log("Plex Servers");
    console.log(plexServers);
  });
  // it("Get Plex Libraries", async function () {
  //   this.timeout(10000);
  //   let response = await PlexSession.GetPlexLibraries();
  //   assert.notEqual(PlexSession.plexLibraries, null);
  //   assert.notEqual(PlexSession.plexLibraries, undefined);
  //   assert.notEqual(PlexSession.plexLibraries, emptyArray);
  //   assert.notEqual(response, emptyArray);
  //   assert.notEqual(response, null);
  //   assert.notEqual(response, undefined);
  //   //console.log("Plex Libraries");
  //   //console.log(PlexSession.plexLibraries);
  // });
  // it("Get Plex Movie Libraries", async function () {
  //   this.timeout(20000);
  //   let response = await PlexSession.GetPlexMovieLibraries();
  //   assert.notEqual(response, emptyArray);
  //   assert.notEqual(response, null);
  //   assert.notEqual(response, undefined);
  //   // console.log("Plex Movie Libraries");
  //   // console.log(response);
  // });
  // it("Get Plex Music Libraries", async function () {
  //   this.timeout(10000);
  //   let response = await PlexSession.GetPlexMusicLibraries();
  //   assert.notEqual(response, emptyArray);
  //   assert.notEqual(response, null);
  //   assert.notEqual(response, undefined);
  //   // console.log("Plex Music Libraries");
  //   // console.log(response);
  // });
  // it("Get Plex TV Libraries", async function () {
  //   this.timeout(10000);
  //   let response = await PlexSession.GetPlexTVShowLibraries();
  //   assert.notEqual(response, emptyArray);
  //   assert.notEqual(response, null);
  //   assert.notEqual(response, undefined);
  //   // console.log("Plex TV Libraries");
  //   // console.log(response);
  // });
  // it("Get Plex Movies", async function () {
  //   this.timeout(10000);
  //   let response = await PlexSession.GetPlexMovies({
  //     "X-Plex-Container-Start": 0,
  //     "X-Plex-Container-Size": 2,
  //   });
  //   assert.notEqual(response, emptyArray);
  //   assert.notEqual(response, null);
  //   assert.notEqual(response, undefined);
  //   // console.log("Plex Movies");
  //   // console.log(response);
  // });
  // it("Get Plex Shows", async function () {
  //   this.timeout(10000);
  //   let response = await PlexSession.GetPlexShows({
  //     "X-Plex-Container-Start": 0,
  //     "X-Plex-Container-Size": 2,
  //   });
  //   assert.notEqual(response, emptyArray);
  //   assert.notEqual(response, null);
  //   assert.notEqual(response, undefined);
  //   // console.log("Plex Shows");
  //   // console.log(response);
  // });
  // it("Get Plex Seasons", async function () {
  //   this.timeout(10000);
  //   let response = await PlexSession.GetPlexSeasons({
  //     "X-Plex-Container-Start": 0,
  //     "X-Plex-Container-Size": 2,
  //   });
  //   assert.notEqual(response, emptyArray);
  //   assert.notEqual(response, null);
  //   assert.notEqual(response, undefined);
  //   // console.log("Plex Seasons");
  //   // console.log(response);
  // });
  // it("Get Plex Episodes", async function () {
  //   this.timeout(20000);
  //   let response = await PlexSession.GetPlexEpisodes({
  //     "X-Plex-Container-Start": 0,
  //     "X-Plex-Container-Size": 2,
  //   });
  //   assert.notEqual(response, emptyArray);
  //   assert.notEqual(response, null);
  //   assert.notEqual(response, undefined);
  //   // console.log("Plex Episodes");
  //   // console.log(response);
  // });
  // it("Get Plex Artists", async function () {
  //   this.timeout(10000);
  //   let response = await PlexSession.GetPlexArtists({
  //     "X-Plex-Container-Start": 0,
  //     "X-Plex-Container-Size": 2,
  //   });
  //   assert.notEqual(response, emptyArray);
  //   assert.notEqual(response, null);
  //   assert.notEqual(response, undefined);
  //   // console.log("Plex Artists");
  //   // console.log(response);
  // });
  // it("Get Plex Albums", async function () {
  //   this.timeout(10000);
  //   let response = await PlexSession.GetPlexAlbums({
  //     "X-Plex-Container-Start": 0,
  //     "X-Plex-Container-Size": 2,
  //   });
  //   assert.notEqual(response, emptyArray);
  //   assert.notEqual(response, null);
  //   assert.notEqual(response, undefined);
  //   // console.log("Plex Albums");
  //   // console.log(response);
  // });
  // it("Get Plex Songs", async function () {
  //   this.timeout(20000);
  //   let response = await PlexSession.GetPlexSongs({
  //     "X-Plex-Container-Start": 0,
  //     "X-Plex-Container-Size": 2,
  //   });
  //   assert.notEqual(response, emptyArray);
  //   assert.notEqual(response, null);
  //   assert.notEqual(response, undefined);
  //   // console.log("Plex Songs");
  //   // console.log(response);
  // });
  // it("Get Plex Songs Paged", async function () {
  //   this.timeout(20000);
  //   let response = GetLibraryPages(PlexSession, "songs");
  //   assert.notEqual(response, emptyArray);
  //   assert.notEqual(response, null);
  //   assert.notEqual(response, undefined);
  //   console.log("Plex Songs Paged");
  //   console.log(response);
  // });
});
