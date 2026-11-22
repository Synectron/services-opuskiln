import type { Env } from "../_lib/env.ts";

type GoogleReview = {
  author: string;
  rating: number;
  text: string;
  relativeTime: string;
};

type ReviewsPayload = {
  rating: number;
  count: number;
  mapsUrl: string;
  reviews: GoogleReview[];
  source: "google_live" | "google_cache";
};

const MAPS_URL = "https://maps.app.goo.gl/WcEaZnDy5wM2RRCK8";
const PLACE_QUERY = "Pure Veg RKN Punjabi Soya Chaap Naini Prayagraj";

const CACHED: ReviewsPayload = {
  rating: 4.7,
  count: 50,
  mapsUrl: MAPS_URL,
  source: "google_cache",
  reviews: [
    {
      author: "Anant Dubey",
      rating: 5,
      text: "Been eating here since years... Best place for street food in naini",
      relativeTime: "2 years ago",
    },
    {
      author: "Veer",
      rating: 5,
      text: "Very tasty food and excellent quality. Amazing experience",
      relativeTime: "2 years ago",
    },
    {
      author: "Nilanshu Srivastava",
      rating: 5,
      text: "Chilli potato was awesome and Veg Manchurian was also really very good. Must try",
      relativeTime: "6 years ago",
    },
    {
      author: "Shivam Gupta",
      rating: 5,
      text: "Good Soya chaap in Naini area with a delicious taste",
      relativeTime: "a year ago",
    },
    {
      author: "Priyanshu Kushwaha",
      rating: 5,
      text: "Inka fast food sach me bhut hi tasty or delicious rehta hai. I love it",
      relativeTime: "2 years ago",
    },
    {
      author: "INSANE MOVEMENT",
      rating: 5,
      text: "Experience was too good, staff was also very good. Overall best place to visit",
      relativeTime: "a year ago",
    },
  ],
};

type PlacesReview = {
  rating?: number;
  relativePublishTimeDescription?: string;
  text?: { text?: string };
  originalText?: { text?: string };
  authorAttribution?: { displayName?: string };
};

type PlaceResult = {
  id?: string;
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: PlacesReview[];
};

async function fetchLiveReviews(
  apiKey: string,
  placeId?: string,
): Promise<ReviewsPayload | null> {
  let id = placeId?.trim();

  if (!id) {
    const search = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.rating,places.userRatingCount,places.googleMapsUri,places.reviews",
        },
        body: JSON.stringify({
          textQuery: PLACE_QUERY,
          maxResultCount: 1,
          languageCode: "en",
        }),
      },
    );
    if (!search.ok) {
      console.error("places search failed", search.status, await search.text());
      return null;
    }
    const body = (await search.json()) as { places?: PlaceResult[] };
    const place = body.places?.[0];
    if (!place) return null;
    return mapPlace(place);
  }

  const details = await fetch(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(id)}`,
    {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "id,rating,userRatingCount,googleMapsUri,reviews",
        "X-Goog-LanguageCode": "en",
      },
    },
  );
  if (!details.ok) {
    console.error(
      "places details failed",
      details.status,
      await details.text(),
    );
    return null;
  }
  return mapPlace((await details.json()) as PlaceResult);
}

function mapPlace(place: PlaceResult): ReviewsPayload {
  const reviews = (place.reviews ?? [])
    .map((review) => {
      const text = (
        review.text?.text ||
        review.originalText?.text ||
        ""
      ).trim();
      const author =
        review.authorAttribution?.displayName?.trim() || "Google reviewer";
      const rating = Number(review.rating) || 0;
      if (!text || rating < 1) return null;
      return {
        author,
        rating,
        text,
        relativeTime: review.relativePublishTimeDescription || "",
      } satisfies GoogleReview;
    })
    .filter((item): item is GoogleReview => Boolean(item))
    .slice(0, 6);

  return {
    rating: place.rating ?? CACHED.rating,
    count: place.userRatingCount ?? CACHED.count,
    mapsUrl: place.googleMapsUri || MAPS_URL,
    reviews: reviews.length ? reviews : CACHED.reviews,
    source: "google_live",
  };
}

function cachedResponse(payload: ReviewsPayload, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const key = context.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!key) return cachedResponse(CACHED);

  try {
    const live = await fetchLiveReviews(key, context.env.GOOGLE_PLACE_ID);
    if (live) return cachedResponse(live);
  } catch (err) {
    console.error(err);
  }
  return cachedResponse(CACHED);
};
