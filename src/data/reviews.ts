export type GoogleReview = {
  author: string;
  rating: number;
  text: string;
  relativeTime: string;
};

export type ReviewsPayload = {
  rating: number;
  count: number;
  mapsUrl: string;
  reviews: GoogleReview[];
  source: "google_live" | "google_cache";
};

/** Google Maps listing (CID) for Pure Veg RKN Punjabi Soya Chaap, Naini. */
export const GOOGLE_MAPS_URL =
  "https://maps.google.com/?cid=18020669597449550895";

export const GOOGLE_PLACE_QUERY =
  "Pure Veg RKN Punjabi Soya Chaap Naini Prayagraj";

/**
 * Reviews taken from the Google Maps listing.
 * Replaced at runtime when GOOGLE_PLACES_API_KEY is set on Pages.
 */
export const CACHED_GOOGLE_REVIEWS: ReviewsPayload = {
  rating: 4.7,
  count: 50,
  mapsUrl: GOOGLE_MAPS_URL,
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
