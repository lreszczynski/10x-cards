import type { APIRoute } from 'astro';
import { createSupabaseServerInstance } from '@/db/supabase.server';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  console.log('Logout request received');

  try {
    const supabase = createSupabaseServerInstance({ 
      cookies, 
      headers: request.headers 
    });

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Logout error:', error);
      return new Response(
        JSON.stringify({ 
          error: error.message 
        }), 
        { 
          status: 400,
          headers: { 
            'Content-Type': 'application/json'
          }
        }
      );
    }

    console.log('Logout successful');
    
    return new Response(
      JSON.stringify({ 
        success: true 
      }), 
      { 
        status: 200,
        headers: { 
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (err) {
    console.error('Logout error:', err);
    return new Response(
      JSON.stringify({ 
        error: err instanceof Error ? err.message : 'Internal server error'
      }), 
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json'
        }
      }
    );
  }
}; 