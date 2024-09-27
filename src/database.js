const sqlite3 = require('sqlite3').verbose();
const AccessKey = require("./access_key");
const utils = require("./utils");

console.log("I  initializing sqlite database");

// --------- DATABASE VARIABLES --------- 

// init database fw.db
const db = new sqlite3.Database('fw.db');
let database_values = {
    keys_registered: 0,
    temp_i: 0
};

// --------- DATABASE INITIALIZATION --------- 

// create initial table for access keys
db.run("CREATE TABLE IF NOT EXISTS keys (player TEXT, key TEXT)");

// we have to cache amount on access keys available right now
db.each("SELECT rowid AS id, * FROM keys", (err, row) => {
    database_values.keys_registered++;
});

// --------- DATABASE FUNCTIONS --------- 

/**
 * check how listing works on sqlite3 module
 */
function debug_key_listing() {
    db.each("SELECT rowid AS id, * FROM keys", (err, row) => {
        console.log(`${row.id}: ${row.player}:${row.key}`);
    });
}

/**
 * check how to add entries into tables
 */
function debug_key_registration() {
    const stmt = db.prepare("INSERT INTO keys VALUES (?, ?)");
    for (let i = 0; i < 10; i++) {
        stmt.run(["test", i]);
    }
    stmt.finalize();
}

/**
 * write access key to the database
 * @param {AccessKey} key 
 */
function add_access_key(key) {
    // validate key argument
    if (!(key instanceof AccessKey)) return;

    // begin database read/write
    console.log("I  writing access key %s:%s to disk", key.get_player(), key.get_key())

    // prepare write
    const stmt = db.prepare("INSERT into keys VALUES (?, ?)");
        
    // add entry with player and key
    stmt.run([key.get_player(), key.get_key()]);
    
    // write entry to disk
    stmt.finalize();

    // increment amount of access keys
    database_values.keys_registered++;
}

/**
 * try to find access key
 * @param {String} key_id
 * @returns {Promise} promise to key instance or null
 */
function try_find_key(key_id) {
    // validate key_id argument
    if (typeof key_id != 'string') return;
    
    // reset i variable
    database_values.temp_i = 0;

    // since db.serialize is an async function without actually
    // mentioning  that we should wait  for data to be resolved

    return new Promise((resolve) => {
        let data = null;

        // loop through all entries in keys table
        db.each("SELECT * FROM keys", (err, row) => {
            // check if error happened
            if (err != null) {
                console.error("E  try_find_key: database error: " + err.message);
                    
                // return nothing
                resolve(null);
            } else {
                const equal = row.key == key_id;

                // console.log(`D  ${row.key}==${key_id}: ${equal}`);

                if (row.key == key_id) {
                    // we found key
                    data = new AccessKey(row.player);
                    data.set_key(row.key);

                    // return actual access key data
                    resolve(data);
                } else {
                    // dirty hax
                    if ((database_values.temp_i + 1) == database_values.keys_registered) {
                        // return nothing;

                        resolve(null);
                    }
                }
            }

            database_values.temp_i++;
        });
    });
}

/**
 * delete access key by key id
 * @param {String} key_id
 */
async function delete_access_key(key_id) {
    // validate key_id argument
    if (typeof key_id != 'string') return;

    // check if key is valid
    const key_instance = await try_find_key(key_id);
    if (key_instance == null) return;

    // begin database read/write
    console.log("I  removing access key %s:%s to disk", key_instance.get_player(), key_instance.get_key())

    // prepare write
    const stmt = db.prepare("DELETE FROM keys WHERE key=?");
        
    // replace ? with key_id
    stmt.run(key_id);
    
    // write changes to disk
    stmt.finalize();

    // decrement amount of access keys
    database_values.keys_registered--;
}

// --------- DATABASE EXPORTS --------- 

module.exports = {
    debug_key_listing: debug_key_listing,
    debug_key_registration: debug_key_registration,

    add_access_key: add_access_key,
    try_find_key: try_find_key,
    delete_access_key: delete_access_key
}