import { PlexAPIOAuth, PlexLogin } from "./index.mjs";
import { strict as assert } from "assert";

describe("Login Test", function () {
  let plexapioauth = new PlexAPIOAuth();
  it("should be able to fail login", function () {
    console.log(plexapioauth);
    plexapioauth.generateClientId();
    console.log(plexapioauth);
    assert.strictEqual(PlexLogin(plexapioauth.plexClientInformation), null);
  });
  //   it("should be able to successfully login", function () {
  //     assert.notEqual(PlexLogin(), null);
  //   });
});
