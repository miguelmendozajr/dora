import { pool } from "../db.js";
import twilio from "twilio";
import { TWILIO_ID, TWILIO_TOKEN } from "../config.js";

const client = twilio(TWILIO_ID, TWILIO_TOKEN);

export const dropTables = async (req, res) => {
    try {
        await pool.query('DROP TABLE cycle');
        await pool.query('DROP TABLE machine');
        await pool.query('DROP TABLE user');
        res.json({ message: 'Tables dropped' });
    } catch (error) {
        return res.status(500).json({
            error
        })
    }
};

export const createTables = async (req, res) => {
    try {
    
        await pool.query(`
            CREATE TABLE machine (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name TEXT NOT NULL,
                onUse BOOLEAN DEFAULT 0,
                washing BOOLEAN DEFAULT 0
            )
        `);

        await pool.query(`
            CREATE TABLE user (
                phone VARCHAR(14) PRIMARY KEY,
                name TEXT NOT NULL
            )
        `);

        await pool.query(`
            CREATE TABLE cycle (
                id INT AUTO_INCREMENT PRIMARY KEY,
                machine_id INT NOT NULL,
                createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                status TEXT NOT NULL,
                startedAt TIMESTAMP,
                user_phone VARCHAR(14),
                FOREIGN KEY (machine_id) REFERENCES machine(id),
                FOREIGN KEY (user_phone) REFERENCES user(phone)
            )
        `);
        
        res.json({ message: 'Tables created' });
    } catch (error) {
        return res.status(500).json({
            error
        })
    }
};


export const seedData = async (req, res) => {
    try {
        await pool.query("INSERT INTO machine (name, onUse, washing) VALUES ('Lavadora', 0, 0)");
        await pool.query("INSERT INTO user (phone, name) VALUES ('+5218713337250', 'Miguel Mendoza')");
        await pool.query("INSERT INTO cycle (machine_id, status, startedAt, user_phone) VALUES (1, 'Not started', NULL, NULL)");

        res.json({ message: 'Database seeded' });
    } catch (error) {
        return res.status(500).json({
            error
        })
    }
};

export const getWaitList = async (req, res) => {
    try {
        const { id } = req.params;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const formattedYesterday = yesterday.toISOString().split('T')[0];
        const today = new Date();
        const formattedToday = today.toISOString().split('T')[0];
        const [rows] = await pool.query("SELECT * FROM cycle INNER JOIN user ON cycle.user_phone = user.phone WHERE machine_id = ? AND startedAt IS NULL AND (createdAt BETWEEN ? AND ?) ORDER BY createdAt ASC", [id, `${formattedYesterday} 00:00:00`, `${formattedToday} 23:59:59`]);
        res.json(rows[0]);
    } catch (error) {
        return res.status(500).json({
            error
        })
    }
}

export const createCycle = async (req, res) => {
    const { id } = req.params;
    const { phone } = req.query;
    
    try {
        await pool.query("INSERT INTO cycle (machine_id, status, startedAt, user_phone) VALUES (?, 'Not started', NULL, ?)", [id, "+" + phone]);
        res.json({ message: 'Cycle created' });
    } catch (error) {
        return res.status(500).json({
            error
        })
    }
}

export const updateMachine = async (req, res) => {
    try {
        const { id } = req.params;
        const { onUse, washing, cycle } = req.query;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const formattedYesterday = yesterday.toISOString().split('T')[0];
        const today = new Date();
        const formattedToday = today.toISOString().split('T')[0];

        const updateFields = {};

        if (cycle !== undefined) {
            await pool.query('UPDATE cycle SET status = ? WHERE machine_id = ? AND status NOT IN (?, ?, ?) AND (createdAt BETWEEN ? AND ?)', [cycle, id, 'Finished', 'Not started', 'Deleted', `${formattedYesterday} 00:00:00`, `${formattedToday} 23:59:59`]);
        }

        if (washing !== undefined) {
            updateFields.washing = parseInt(washing);
            // if washing = 0 notify user 
            if (updateFields.washing == 0 && onUse == undefined){
                let userPhone = undefined;
                try {
                    const [rows] = await pool.query("SELECT * FROM cycle INNER JOIN user ON cycle.user_phone = user.phone WHERE machine_id = ? AND status NOT IN (?, ?, ?) AND (createdAt BETWEEN ? AND ?) ORDER BY createdAt ASC LIMIT 1", [id, 'Finished', 'Not started', 'Deleted', `${formattedYesterday} 00:00:00`, `${formattedToday} 23:59:59`]);
                    console.log(rows);
                    userPhone = rows[0].user_phone;
                } catch (e) {
                    console.log(e);
                }
                if (userPhone){
                    client.messages
                    .create({
                        body: "El ciclo de lavado ha finalizado. Recoge tu ropa.",
                        from: 'whatsapp:+14155238886',
                        to: `whatsapp:${userPhone}`
                    })
                    .then(message => console.log(message.sid));
                }
                
                await pool.query('UPDATE cycle SET status = ? WHERE machine_id = ? AND status NOT IN (?, ?, ?) AND (createdAt BETWEEN ? AND ?)', ['Finished', id, 'Finished', 'Not started', 'Deleted', `${formattedYesterday} 00:00:00`, `${formattedToday} 23:59:59`]);
       
            } else if (updateFields.washing == 1) {
                if (cycle == "Washing"){
                    const [row] = await pool.query('SELECT id FROM cycle WHERE machine_id = ? AND status = ? AND createdAt BETWEEN ? AND ? ORDER BY createdAt ASC LIMIT 1', [id, 'Not started', `${formattedYesterday} 00:00:00`, `${formattedToday} 23:59:59`]);
                    if (row.length > 1){
                        await pool.query('UPDATE cycle SET status = ?, startedAt = CURRENT_TIMESTAMP WHERE id = ?', ['Washing', row[0].id]);
                    } else {
                        await pool.query("INSERT INTO cycle (machine_id, status, startedAt, createdAt, user_phone) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL)", [id, 'Washing']);
                    }
                } 
            }

        }

        if (onUse !== undefined) {
            updateFields.onUse = parseInt(onUse);
            // if onUse = 0 notify user
            
            if (updateFields.onUse == 0){
                let userPhone = undefined;
                try {
                    const [rows] = await pool.query("SELECT * FROM cycle INNER JOIN user ON cycle.user_phone = user.phone WHERE machine_id = ? AND status = ? AND (createdAt BETWEEN ? AND ?) ORDER BY createdAt ASC LIMIT 1", [id, 'Not started', `${formattedYesterday} 00:00:00`, `${formattedToday} 23:59:59`]);
                    
                    userPhone = rows[0].user_phone
                } catch (e) {
                    console.log(e);
                }
                if (userPhone){
                    client.messages
                    .create({
                        body: 'Es tu turno de lavar la ropa. La lavadora está disponible para ti ahora mismo.',
                        from: 'whatsapp:+14155238886',
                        to: `whatsapp:${userPhone}`
                    })
                    .then(message => console.log(message.sid));
                };
            }

        }

        if (Object.keys(updateFields).length > 0) {
            await pool.query('UPDATE machine SET ? WHERE id = ?', [updateFields, id]);
        }

        res.json({ message: 'Updated' });
    } catch (error) {
        return res.status(500).json({
            error
        });
    }
};