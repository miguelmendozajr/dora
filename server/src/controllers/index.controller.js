import { pool } from "../db.js";
import twilio from "twilio";
import { TWILIO_ID, TWILIO_TOKEN } from "../config.js";

const client = twilio(TWILIO_ID, TWILIO_TOKEN);

export const dropTables = async (req, res) => {
    try {
        await pool.query('DROP DATABASE railway');
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
            CREATE DATABASE railway
        `);

        await pool.query('USE railway');
    
        await pool.query(`
            CREATE TABLE machine (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name TEXT NOT NULL,
                cycle_id INT
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
                warning BOOLEAN DEFAULT 0,
                FOREIGN KEY (machine_id) REFERENCES machine(id),
                FOREIGN KEY (user_phone) REFERENCES user(phone)
            )
        `);

        await pool.query(`ALTER TABLE machine ADD FOREIGN KEY (cycle_id) REFERENCES cycle(id)`);
        
        res.json({ message: 'Tables created' });
    } catch (error) {
        return res.status(500).json({
            error
        })
    }
};


export const seedData = async (req, res) => {
    try {
        await pool.query("INSERT INTO machine (name) VALUES ('Whirpool 7MWFW5605MC')");
        res.json({ message: 'Database seeded' });
    } catch (error) {
        return res.status(500).json({
            error
        })
    }
};

export const saveUser = async (req, res) => {
    try{
        const { name, phone } = req.query;
        const [rows] = await pool.query("SELECT * FROM user WHERE phone = ?", [`+${phone}`])
        if (rows.length > 0){
            return res.status(200).json({
                message: 'User was already created'
            })
        }
        await pool.query("INSERT INTO user (phone, name) VALUES (?, ?)", [`+${phone}`, name]);
        res.json({ message: 'User successfully created' });
    } catch (error){
        return res.status(500).json({
            error
        })
    }
}

export const createCycle = async (req, res) => {
    const { id } = req.params;
    const { phone } = req.query;
    try {
        const insertResult = await pool.query("INSERT INTO cycle (machine_id, status, user_phone) VALUES (?, 'Not started', ?)", [id, `+${phone}`]);
        const newCycleId = insertResult[0].insertId;
        res.json({ message: 'Cycle successfully created', id: newCycleId });
    } catch (error) {
        return res.status(500).json({
            error
        })
    }
}

export const updateCycle = async (req, res) => {
    const { id } = req.params
    const { phone } = req.query;
    try {
        await pool.query('UPDATE cycle INNER JOIN machine ON machine.cycle_id = cycle.id SET user_phone = ? WHERE machine.id = ?', [`+${phone}`, id]);
        res.json({ message: 'Cycle successfully canceled' });
    } catch (error) {
        return res.status(500).json({
            error
        })
    }
}

export const cancelCycle = async (req, res) => {
    const { id } = req.query;
    try {
        await pool.query("UPDATE cycle SET status = ? WHERE id = ?", ['Canceled', id]);
        res.json({ message: 'Cycle successfully canceled' });
    } catch (error) {
        return res.status(500).json({
            error
        })
    }
}

export const getMachine = async (req, res) => {
    try {
        const { id } = req.params;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const formattedYesterday = yesterday.toISOString().split('T')[0];
        const today = new Date();
        const formattedToday = today.toISOString().split('T')[0];
        const [rows] = await pool.query("SELECT * FROM cycle INNER JOIN user ON cycle.user_phone = user.phone WHERE machine_id = ? AND status = ? AND (createdAt BETWEEN ? AND ?) ORDER BY createdAt ASC", [id, 'Not started', `${formattedYesterday} 00:00:00`, `${formattedToday} 23:59:59`]);
        const [rows2] = await pool.query("SELECT * FROM machine WHERE id = ?", [id]);
        const [rows3] = await pool.query("SELECT * FROM machine INNER JOIN cycle ON machine.cycle_id = cycle.id WHERE machine_id = ?", [id]);

        res.json({
            machine: rows2[0],
            cycle: rows3[0],
            waitlist: rows
        });
    } catch (error) {
        return res.status(500).json({
            error
        })
    }
}

export const updateMachine = async (req, res) => {
    try {
        const { id } = req.params;
        const { onUse, washing, cycle, warning } = req.query;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const formattedYesterday = yesterday.toISOString().split('T')[0];
        const today = new Date();
        const formattedToday = today.toISOString().split('T')[0];

        const updateFields = {};

        if (cycle !== undefined && cycle !== "Washing") {
            await pool.query('UPDATE cycle INNER JOIN machine ON machine.cycle_id = cycle.id SET status = ? WHERE machine.id = ?', [cycle, id]);
        }

        if (warning !== undefined) {
            await pool.query('UPDATE cycle INNER JOIN machine ON machine.cycle_id = cycle.id SET warning = 1 WHERE machine.id = ?', [id]);
        }

        if (washing !== undefined) {
            updateFields.washing = parseInt(washing);
            if (updateFields.washing == 0 && onUse == undefined){
                
                const [rows] = await pool.query('SELECT * FROM cycle INNER JOIN machine ON machine.cycle_id = cycle.id')
                if (rows[0].user_phone){
                    client.messages
                    .create({
                        body: "El ciclo de lavado ha finalizado. Recoge tu ropa.",
                        from: 'whatsapp:+14155238886',
                        to: `whatsapp:${rows[0].user_phone}`
                    })
                    .then(message => console.log(message.sid));
                }
                await pool.query('UPDATE cycle INNER JOIN machine ON machine.cycle_id = cycle.id SET status = ? WHERE machine.id = ?', ['Finished', id]);
                       
            } else if (updateFields.washing == 1) {
                
                if (cycle == "Washing"){
                    const [row] = await pool.query('SELECT id FROM cycle WHERE machine_id = ? AND status = ? AND createdAt BETWEEN ? AND ? ORDER BY createdAt ASC LIMIT 1', [id, 'Not started', `${formattedYesterday} 00:00:00`, `${formattedToday} 23:59:59`]);
                    
                    if (row.length >= 1){
                        await pool.query('UPDATE cycle SET status = ?, startedAt = CURRENT_TIMESTAMP WHERE id = ?', ['Washing', row[0].id]);
                        await pool.query('UPDATE machine SET cycle_id = ? WHERE id = ?', [row[0].id, id]);
                    } else {
                        const insertResult = await pool.query("INSERT INTO cycle (machine_id, status, startedAt, createdAt, user_phone) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL)", [id, 'Washing']);
                        console.log(insertResult);
                        const newCycleId = insertResult[0].insertId;
                        console.log(newCycleId);
                        await pool.query('UPDATE machine SET cycle_id = ? WHERE id = ?', [newCycleId, id]);
                    }
                }
                if (warning !== undefined) {
                    await pool.query('UPDATE cycle INNER JOIN machine ON machine.cycle_id = cycle.id SET warning = 1 WHERE machine.id = ?', [id]);
                }
            }

        }

        if (onUse !== undefined) {
            updateFields.onUse = parseInt(onUse);
            
            if (updateFields.onUse == 0){            
                const [rows] = await pool.query("SELECT * FROM cycle WHERE machine_id = ? AND status = ? AND (createdAt BETWEEN ? AND ?) ORDER BY createdAt ASC LIMIT 1", [id, 'Not started', `${formattedYesterday} 00:00:00`, `${formattedToday} 23:59:59`]);
                console.log(rows[0].user_phone);
                if (rows[0].user_phone){
                    client.messages
                    .create({
                        body: 'Es tu turno de lavar la ropa. La lavadora está disponible para ti ahora mismo.',
                        from: 'whatsapp:+14155238886',
                        to: `whatsapp:${rows[0].user_phone}`
                    })
                    .then(message => console.log(message.sid));
                };
                await pool.query('UPDATE machine SET cycle_id = NULL WHERE id = ?', [id]);
            }

        }
        res.json({ message: 'Updated' });
    } catch (error) {
        return res.status(500).json({
            error
        });
    }
};