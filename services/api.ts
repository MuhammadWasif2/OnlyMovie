export const TMDB_CONFIG = {
    BASE_URL: "https://api.themoviedb.org/3",
    API_KEY: process.env.EXPO_PUBLIC_MOVIE_API_KEY,
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${process.env.EXPO_PUBLIC_MOVIE_API_KEY}`,
    },
  };
  
  export const fetchMovies = async ({
    query,
    page = 1,
  }: {
    query: string;
    page?: number;
  }): Promise<Movie[]> => {
    const endpoint = query
      ? `${TMDB_CONFIG.BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${page}`
      : `${TMDB_CONFIG.BASE_URL}/discover/movie?sort_by=popularity.desc&page=${page}`;
  
    const response = await fetch(endpoint, {
      method: "GET",
      headers: TMDB_CONFIG.headers,
    });
  
    if (!response.ok) {
      throw new Error(`Failed to fetch movies: ${response.statusText}`);
    }
  
    const data = await response.json();
    return data.results;
  };
  
  export const fetchMovieDetails = async (
    movieId: string
  ): Promise<MovieDetails> => {
    try {
      const response = await fetch(
        `${TMDB_CONFIG.BASE_URL}/movie/${movieId}?api_key=${TMDB_CONFIG.API_KEY}`,
        {
          method: "GET",
          headers: TMDB_CONFIG.headers,
        }
      );
  
      if (!response.ok) {
        throw new Error(`Failed to fetch movie details: ${response.statusText}`);
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching movie details:", error);
      throw error;
    }
  };

  export const fetchMovieTrailers = async (
    movieId: string
  ): Promise<MovieTrailer[]> => {
    try {
      const response = await fetch(
        `${TMDB_CONFIG.BASE_URL}/movie/${movieId}/videos?api_key=${TMDB_CONFIG.API_KEY}`,
        {
          method: "GET",
          headers: TMDB_CONFIG.headers,
        }
      );
  
      if (!response.ok) {
        throw new Error(`Failed to fetch movie trailers: ${response.statusText}`);
      }
  
      const data = await response.json();
      // Filter for official trailers and teasers
      const trailers = data.results.filter((video: any) => 
        video.type === "Trailer" && 
        (video.site === "YouTube" || video.site === "Vimeo") &&
        video.official === true
      );
      
      return trailers;
    } catch (error) {
      console.error("Error fetching movie trailers:", error);
      throw error;
    }
  };

export const fetchMovieCredits = async (movieId: string): Promise<CastMember[]> => {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/movie/${movieId}/credits?api_key=${TMDB_CONFIG.API_KEY}`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch movie credits: ${response.statusText}`);
    }

    const data = await response.json();
    return data.cast;
  } catch (error) {
    console.error("Error fetching movie credits:", error);
    throw error;
  }
};

  // Test function to verify trailer API
  export const testTrailerAPI = async (movieId: string = "550") => {
    try {
      console.log("Testing trailer API for movie ID:", movieId);
      const trailers = await fetchMovieTrailers(movieId);
      console.log("Found trailers:", trailers.length);
      console.log("First trailer:", trailers[0]);
      return trailers;
    } catch (error) {
      console.error("Trailer API test failed:", error);
      return [];
    }
  };

console.log("Appwrite endpoint:", process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID);