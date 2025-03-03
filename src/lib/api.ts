/**
 * Utility functions for interacting with the FastAPI backend
 */

/**
 * Base API client for making requests to the FastAPI backend
 */
export const api = {
  /**
   * Make a GET request to the API
   * @param endpoint - The API endpoint to request
   * @param params - Optional query parameters
   * @returns The response data
   */
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`/api${endpoint}`, window.location.origin);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json() as Promise<T>;
  },
  
  /**
   * Make a POST request to the API
   * @param endpoint - The API endpoint to request
   * @param data - The data to send
   * @returns The response data
   */
  async post<T>(endpoint: string, data: unknown): Promise<T> {
    const url = `/api${endpoint}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json() as Promise<T>;
  },
  
  /**
   * Make a DELETE request to the API
   * @param endpoint - The API endpoint to request
   * @returns The response data
   */
  async delete(endpoint: string): Promise<void> {
    const url = `/api${endpoint}`;
    
    const response = await fetch(url, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
  },
};

/**
 * Art API client for interacting with art-related endpoints
 */
export const artApi = {
  /**
   * Get all art pieces
   * @param limit - Optional limit for pagination
   * @param skip - Optional skip for pagination
   * @returns Array of art pieces
   */
  async getAll(limit = 10, skip = 0) {
    return api.get('/art/', { limit: limit.toString(), skip: skip.toString() });
  },
  
  /**
   * Get a specific art piece by ID
   * @param id - The art piece ID
   * @returns The art piece
   */
  async getById(id: number) {
    return api.get(`/art/${id}`);
  },
  
  /**
   * Create a new art piece
   * @param data - The art piece data
   * @returns The created art piece
   */
  async create(data: {
    title: string;
    description?: string;
    parameters: Record<string, number>;
    created_by?: string;
  }) {
    return api.post('/art/', data);
  },
  
  /**
   * Delete an art piece
   * @param id - The art piece ID
   */
  async delete(id: number) {
    return api.delete(`/art/${id}`);
  },
}; 