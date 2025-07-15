import { Account, Avatars, Client, Databases, ID, Query } from "appwrite";

const config = {
  endpoint: "https://cloud.appwrite.io/v1", // Fixed endpoint URL
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
  usersCollectionId: process.env.EXPO_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
  trendingCollectionId: process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!,
  savedMoviesCollectionId: process.env.EXPO_PUBLIC_APPWRITE_SAVED_MOVIES_COLLECTION_ID!,
};

const client = new Client()
  .setEndpoint(config.endpoint)
  .setProject(config.projectId);

const account = new Account(client);
const database = new Databases(client);
const avatars = new Avatars(client);

// --- USER AUTHENTICATION FUNCTIONS ---

export const createUser = async (email: string, password: string, username: string) => {
    try {
        // First, try to sign out any existing session
        try {
            await account.deleteSession('current');
        } catch (e) {
            // Ignore errors if no session exists
        }

        const newAccount = await account.create(
            ID.unique(),
            email,
            password,
            username
        );

        if (!newAccount) throw new Error("Account creation failed");

        const avatarUrl = avatars.getInitials(username);

        // Create session after account creation
        await signIn(email, password);

        const newUser = await database.createDocument(
            config.databaseId,
            config.usersCollectionId,
            ID.unique(),
            {
                accountId: newAccount.$id,
                username: username,
                avatar: avatarUrl.toString()
            }
        );

        return newUser;
    } catch (error: any) {
        console.error("Error in createUser:", error);
        throw new Error(error.message || "Failed to create user");
    }
}

export const signIn = async (email: string, password: string) => {
    try {
        // First, try to delete any existing session
        try {
            await account.deleteSession('current');
        } catch (e) {
            // Ignore errors if no session exists
        }

        const session = await account.createEmailPasswordSession(email, password);
        return session;
    } catch (error: any) {
        console.error("Error in signIn:", error);
        throw new Error(error.message || "Failed to sign in");
    }
}

export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get();

        if (!currentAccount) throw new Error("User not found");

        const currentUser = await database.listDocuments(
            config.databaseId,
            config.usersCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
        );

        if (!currentUser || currentUser.documents.length === 0) {
            console.log("No user document found in DB for accountId:", currentAccount.$id);
            return null;
        }

        return currentUser.documents[0];
    } catch (error: any) {
        // Don't log this as an error if it's just a guest user (expected behavior)
        if (error.message && error.message.includes('guests') && error.message.includes('missing scope')) {
            console.log("No authenticated user found (guest mode)");
            return null;
        }
        console.error("Error in getCurrentUser:", error);
        return null; // Return null instead of throwing an error for session checks
    }
}

export const signOut = async () => {
    try {
        const session = await account.deleteSession('current');
        return session;
    } catch (error: any) {
        console.error("Error in signOut:", error);
        throw new Error(error.message || "Failed to sign out");
    }
}

// --- SAVED MOVIES FUNCTIONS ---

// Save a movie
export const saveMovie = async (userId: string, movie: any) => {
    try {
        const document = {
            user_1: userId,
            movie_id: movie.id,
            title: movie.title,
            poster_path: movie.poster_path,
            release_date1: movie.release_date,
        };
        const newSavedMovie = await database.createDocument(
            config.databaseId,
            config.savedMoviesCollectionId,
            ID.unique(),
            document
        );
        return newSavedMovie;
    } catch (error: any) {
        console.error("Error in saveMovie:", error);
        throw new Error(error.message || "Failed to save movie");
    }
};

// Unsave a movie
export const unsaveMovie = async (docId: string) => {
    try {
        const result = await database.deleteDocument(
            config.databaseId,
            config.savedMoviesCollectionId,
            docId
        );
        return result;
    } catch (error: any) {
        console.error("Error in unsaveMovie:", error);
        throw new Error(error.message || "Failed to unsave movie");
    }
};

// Get all saved movies for a user
export const getSavedMovies = async (userId: string) => {
    try {
        const response = await database.listDocuments(
            config.databaseId,
            config.savedMoviesCollectionId,
            [Query.equal("user_1", userId)]
        );
        return response.documents;
    } catch (error: any) {
        console.error("Error in getSavedMovies:", error);
        throw new Error(error.message || "Failed to get saved movies");
    }
};

// --- MOVIE DATABASE FUNCTIONS ---

export const updateSearchCount = async (query: string, movie: Movie) => {
    try {
      // Query to check if the movie search term exists
      const result = await database.listDocuments(config.databaseId, config.trendingCollectionId, [
        Query.equal('searchTerm', query) // Use movie ID as unique identifier
      ]);
  
      if (result.documents.length > 0) {
        // If the movie exists, update its count
        const existingMovie = result.documents[0];
        await database.updateDocument(
          config.databaseId,
          config.trendingCollectionId,
          existingMovie.$id,
          {
            count: existingMovie.count + 1 // Increment the count
          }
        );
      } else {
        // If the movie doesn't exist, create a new document
        await database.createDocument(config.databaseId, config.trendingCollectionId, ID.unique(), {
          searchTerm: query, // Store the search term for reference
          movie_id: movie.id,
          title: movie.title,
          count: 1, // Initial count when searched for the first time
          poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        });
      }
    } catch (error) {
      console.error("Error updating search count:", error);
      throw error;
    }
  };
  

export const getTrendingMovies = async (): Promise<TrendingMovie[] | undefined> => {
    try {
      const result = await database.listDocuments(config.databaseId, config.trendingCollectionId, [
        Query.greaterThan("count", 0), // ensure only movies with actual views
        Query.limit(5),
        Query.orderDesc("count"),
      ]);
  
      return result.documents as unknown as TrendingMovie[];
    } catch (error) {
      console.error("Error fetching trending movies:", error);
      return undefined;
    }
  };
  