import { ApiKeyManager } from "@esri/arcgis-rest-request";
import fetchMock from "fetch-mock";
import { findPlacesNearPoint } from "../src/index.js";
import {
  placeNearPointMockNoMoreResults,
  placeNearPointMockMoreResults
} from "./mocks/nearPoint.mock.js";

describe("findPlacesNearPoint()", () => {
  afterEach(() => {
    fetchMock.restore();
  });

  it("should return places near a point and not return a next page when there are no more results", async () => {
    fetchMock.mock("*", placeNearPointMockNoMoreResults);

    const response = await findPlacesNearPoint({
      x: -3.1883,
      y: 55.9533,
      radius: 10,
      authentication: ApiKeyManager.fromKey("MOCK_KEY")
    });

    const [url, options] = fetchMock.lastCall("*");

    expect(response.results).toEqual(
      placeNearPointMockNoMoreResults.results as any
    );
    expect(response.results).toEqual(
      placeNearPointMockNoMoreResults.results as any
    );
    expect(response.nextPage).toBeUndefined();
    expect(url).toContain("token=MOCK_KEY");
  });

  it("should return places near a point and a next page when there are more results", async () => {
    fetchMock.mock("*", placeNearPointMockMoreResults);

    const firstPageResponse = await findPlacesNearPoint({
      x: -3.1883,
      y: 55.9533,
      authentication: ApiKeyManager.fromKey("MOCK_KEY")
    });

    const [firstPageUrl, firstPageOptions] = fetchMock.lastCall("*");

    expect(firstPageResponse.results).toEqual(
      placeNearPointMockMoreResults.results as any
    );
    expect(firstPageResponse.results).toEqual(
      placeNearPointMockMoreResults.results as any
    );
    expect(firstPageResponse.nextPage).toBeDefined();
    expect(firstPageUrl).toContain("token=MOCK_KEY");

    fetchMock.restore();
    fetchMock.mock("*", placeNearPointMockNoMoreResults);

    if (!firstPageResponse.nextPage) {
      fail("Expected next page function");
      return;
    }

    const nextPage = await firstPageResponse.nextPage();

    const [url, options] = fetchMock.lastCall("*");

    expect(nextPage.results).toEqual(
      placeNearPointMockNoMoreResults.results as any
    );
    expect(nextPage.results).toEqual(
      placeNearPointMockNoMoreResults.results as any
    );
    expect(nextPage.nextPage).toBeUndefined();
    expect(url).toContain("token=MOCK_KEY");
  });
});
