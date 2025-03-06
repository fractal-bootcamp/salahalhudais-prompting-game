-- Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS "generative-art_game_image" (
    id SERIAL PRIMARY KEY,
    image_path VARCHAR(512) NOT NULL,
    original_prompt TEXT NOT NULL,
    difficulty INTEGER NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    target_words JSONB
);

-- Clear existing data if needed
-- DELETE FROM "generative-art_game_image";

-- Insert data
INSERT INTO "generative-art_game_image" (image_path, original_prompt, difficulty, active, target_words) VALUES
('/game-images/puns/time_flies.png', 'A surreal image of a clock with butterfly wings flying through a blue sky', 2, true, '["time","flies"]'),
('/game-images/puns/bread_winner.png', 'A loaf of bread wearing a gold medal and standing on a winner''s podium', 2, true, '["bread","winner"]'),
('/game-images/puns/brain_freeze.png', 'A cartoon brain character trapped in an ice cube, looking cold', 2, true, '["brain","freeze"]'),
('/game-images/puns/hot_dog.png', 'A dachshund dog wearing sunglasses and lying on a beach towel under the sun', 1, true, '["hot","dog"]'),
('/game-images/puns/cat_nap.png', 'A cute cat sleeping peacefully on a giant napkin', 1, true, '["cat","nap"]'),
('/game-images/puns/bookworm.png', 'A cartoon worm wearing glasses and reading a book in a library', 2, true, '["book","worm"]'),
('/game-images/puns/eye_candy.png', 'A realistic eyeball made of colorful candy and lollipops', 3, true, '["eye","candy"]'),
('/game-images/puns/couch_potato.png', 'A potato character with arms and legs lounging on a couch watching TV', 2, true, '["couch","potato"]'),
('/game-images/puns/fish_out_of_water.png', 'A fish with a confused expression flopping in a desert with cacti', 3, true, '["fish","water"]'),
('/game-images/puns/spill_the_beans.png', 'Coffee beans spilling out of an overturned coffee cup on a table', 3, true, '["spill","beans"]'),
('/game-images/puns/monkey_business.png', 'Monkeys in business suits having a meeting in an office', 3, true, '["monkey","business"]'),
('/game-images/puns/pig_out.png', 'A pig sitting at a table with an empty plate and many food wrappers', 2, true, '["pig","out"]'),
('/game-images/puns/chicken_scratch.png', 'A chicken using its feet to draw or write on the ground', 4, true, '["chicken","scratch"]'),
('/game-images/puns/holy_cow.png', 'A cow with a halo floating above its head in a heavenly setting', 2, true, '["holy","cow"]'),
('/game-images/puns/elephant_in_the_room.png', 'A living room with people ignoring a large elephant standing among them', 2, true, '["elephant","room"]'),
('/game-images/puns/velvet_pumpkin.png', 'Visualize a pumpkin with a lush, velvet surface. Its deep orange hue should contrast beautifully against a clean white background.', 1, true, '["velvet","pumpkin"]'),
('/game-images/puns/glassy_penguin.png', 'Imagine a penguin made completely out of glass, catching the cold sunlight as it slides on an iceberg.', 2, true, '["glassy","penguin"]'),
('/game-images/puns/giant_teacup.png', 'Picture a teacup, large enough for a person to sit in comfortably, filled with steaming hot tea and situated in a quiet, peaceful garden.', 3, true, '["giant","teacup"]'),
('/game-images/puns/holographic_castle.png', 'Envision a castle shimmering in a spectrum of colors, built entirely from holograms. The castle should still feature typical architecture, but with a spectral, ethereal quality.', 4, true, '["holographic","castle"]'),
('/game-images/puns/crystal_rainforest.png', 'Imagine a lush rainforest where the foliage, wildlife, and even the rain are all made of glistening, multi-colored crystals.', 5, true, '["crystal","rainforest"]'),
('/game-images/puns/invisible_symphony.png', 'Translate music into visual art. Picture soundwaves transforming into vibrant, invisible threads filling a concert hall with a palpable, mesmerizing energy.', 6, true, '["invisible","symphony"]'),
('/game-images/puns/living_constellation.png', 'Dream of a constellation in the night sky, but the stars are living, glowing creatures, creating an awe-inspiring, organic celestial structure.', 7, true, '["living","constellation"]'),
('/game-images/puns/recursive_jungle.png', 'Visualize a jungle where each element, from leaves to trees to animals, is a smaller jungle in itself, creating a visually complex, infinite loop of regression.', 8, true, '["recursive","jungle"]'),
('/game-images/puns/quantum_symphony.png', 'Imagine a symphony orchestra where each musician exists in a superposition, creating infinite musical possibilities all playing simultaneously and somehow, harmoniously.', 9, true, '["quantum","symphony"]'),
('/game-images/puns/four_dimensional_labyrinth.png', 'Picture a labyrinth that not only extends spatially, but also temporally. One can traverse not just left, right, forward, or back, but also forward and backward in time.', 10, true, '["four-dimensional","labyrinth"]'); 