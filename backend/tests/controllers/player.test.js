import { describe, it, beforeAll, afterAll, beforeEach, afterEach, expect, test, spyOn, clearAllMocks, vi  } from 'vitest';
import Player from '../../models/Player.mjs'
import Team from '../../models/Team.mjs'
import Tournament from '../../models/Tournament.mjs'
import { addNewPlayer, addNewPlayers } from '../../services/player.mjs'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'


// tests for updatePlayers
test("sample test", () => { 
    expect(true).toBe(true)
})
 

// tests for setPlayerSalary

