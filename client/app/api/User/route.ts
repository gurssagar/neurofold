import { NextResponse } from 'next/server';
import { db } from '../../../db/index';
import { users } from '../../../db/schema';
import { eq } from 'drizzle-orm';

// Create a new user
export async function POST(request: Request) {
    try {
        const { name, image, email, username } = await request.json();

        const newUser = await db.insert(users).values({
            name,
            image,
            email,
            username: username ? username.toString() : `user_${Date.now()}`
        }).returning();

        return NextResponse.json({ 
            success: true, 
            user: newUser 
        });

    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

// Get all users
export async function GET() {
    try {
        const allUsers = await db.select().from(users);
        return NextResponse.json({ users: allUsers });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Update a user
export async function PUT(request: Request) {
    try {
        const { username, decrementCoins, ...updateData } = await request.json();

        // If decrementCoins flag is set, get current coins and decrement
        if (decrementCoins) {
            const currentUser = await db.select().from(users).where(eq(users.username, username));
            
            if (currentUser.length > 0) {
                const currentCoins = currentUser[0].coins || 0;
                const newCoins = Math.max(0, currentCoins - 1); // Ensure coins don't go below 0
                
                updateData.coins = newCoins;
            }
        }

        const updatedUser = await db.update(users)
            .set(updateData)
            .where(eq(users.username, username))
            .returning();

        return NextResponse.json({ 
            success: true, 
            user: updatedUser 
        });

    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

// Delete a user
export async function DELETE(request: Request) {
    try {
        const { username } = await request.json();

        await db.delete(users)
            .where(eq(users.username, username));

        return NextResponse.json({ 
            success: true 
        });

    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}