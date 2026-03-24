from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room
from pymongo import MongoClient
from datetime import datetime
import uuid, os

app = Flask(__name__)
app.secret_key = "studyhive_secret"

socketio = SocketIO(app, cors_allowed_origins="*")

# ======================
# MONGODB
# ======================
MONGO_URI = os.environ.get("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["studyhive"]

users = db["users"]
rooms_db = db["rooms"]
doubts = db["doubts"]

# ======================
# ADMIN LOGIN
# ======================
ADMIN_EMAIL = "admin123"
ADMIN_PASSWORD = "rushithisthemostop"

# ======================
# ROLES SYSTEM
# ======================
ROLE_POWER = {
    "student": 0,
    "moderator": 1,
    "jr_admin": 2,
    "teacher": 3,
    "principal": 4,
    "admin": 99
}

# ======================
# HELPERS
# ======================
def make_id():
    return str(uuid.uuid4())[:8]

def now():
    return datetime.now().strftime("%H:%M")

def add_xp(uid, amount):
    users.update_one({"uid": uid}, {"$inc": {"xp": amount}})
    u = users.find_one({"uid": uid})
    level = u.get("xp", 0) // 100
    users.update_one({"uid": uid}, {"$set": {"level": level}})
    return level

def has_power(user_role, required):
    return ROLE_POWER.get(user_role, 0) >= ROLE_POWER.get(required, 0)

# ======================
# ROUTES
# ======================
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/admin")
def admin():
    return render_template("admin.html")

# ======================
# AUTH
# ======================
@app.route("/api/register", methods=["POST"])
def register():
    d = request.json

    if users.find_one({"email": d["email"]}):
        return jsonify({"error": "User exists"}), 400

    uid = make_id()

    users.insert_one({
        "uid": uid,
        "name": d["name"],
        "email": d["email"],
        "password": d["password"],
        "role": "student",
        "xp": 0,
        "level": 0,
        "joined": now()
    })

    return jsonify({"uid": uid})

@app.route("/api/login", methods=["POST"])
def login():
    d = request.json

    # ADMIN LOGIN
    if d["email"] == ADMIN_EMAIL and d["password"] == ADMIN_PASSWORD:
        return jsonify({
            "uid": "admin",
            "name": "Rushith",
            "role": "admin"
        })

    user = users.find_one({
        "email": d["email"],
        "password": d["password"]
    })

    if not user:
        return jsonify({"error": "Invalid login"}), 401

    return jsonify({
        "uid": user["uid"],
        "name": user["name"],
        "role": user["role"],
        "xp": user.get("xp", 0),
        "level": user.get("level", 0)
    })

# ======================
# USERS CONTROL
# ======================
@app.route("/api/users")
def get_users():
    return jsonify(list(users.find({}, {"_id": 0})))

@app.route("/api/set_role", methods=["POST"])
def set_role():
    d = request.json

    admin_role = d.get("admin_role")
    target_uid = d.get("uid")
    new_role = d.get("role")

    if not has_power(admin_role, "jr_admin"):
        return jsonify({"error": "No permission"}), 403

    users.update_one({"uid": target_uid}, {"$set": {"role": new_role}})
    return jsonify({"ok": True})

@app.route("/api/give_xp", methods=["POST"])
def give_xp():
    d = request.json

    if not has_power(d.get("role"), "teacher"):
        return jsonify({"error": "No permission"}), 403

    level = add_xp(d["uid"], int(d["amount"]))
    return jsonify({"level": level})

# ======================
# HIDDEN PROGRESS (SPECIAL)
# ======================
@app.route("/api/progress/<uid>")
def get_progress(uid):
    viewer_role = request.args.get("role", "student")

    user = users.find_one({"uid": uid})

    if not user:
        return jsonify({})

    data = {
        "xp": user.get("xp", 0),
        "level": user.get("level", 0)
    }

    # 🔥 ONLY PRINCIPAL+ CAN SEE EXTRA
    if has_power(viewer_role, "principal"):
        data["secret"] = "🔥 Advanced stats unlocked"
        data["rank"] = user.get("xp", 0) // 50

    return jsonify(data)

# ======================
# ROOMS (FAST)
# ======================
rooms = {}
messages = {}

@app.route("/api/rooms", methods=["GET"])
def get_rooms():
    return jsonify(list(rooms.values()))

@app.route("/api/rooms", methods=["POST"])
def create_room():
    d = request.json

    rid = make_id()

    room = {
        "id": rid,
        "name": d["name"],
        "host": d["host"],
        "members": []
    }

    rooms[rid] = room
    messages[rid] = []

    return jsonify(room)

# ======================
# DOUBTS
# ======================
@app.route("/api/doubts", methods=["GET"])
def get_doubts():
    return jsonify(list(doubts.find({}, {"_id": 0})))

@app.route("/api/doubts", methods=["POST"])
def add_doubt():
    d = request.json

    doubt = {
        "id": make_id(),
        "title": d["title"],
        "author": d["author"],
        "answers": [],
        "time": now()
    }

    doubts.insert_one(doubt)
    return jsonify(doubt)

# ======================
# SOCKET CHAT
# ======================
@socketio.on("join_room")
def on_join(data):
    rid = data["room"]
    name = data["name"]

    join_room(rid)

    if rid in rooms:
        rooms[rid]["members"].append(name)

    emit("user_joined", {"name": name}, to=rid)

@socketio.on("send_message")
def on_msg(data):
    rid = data["room"]

    msg = {
        "name": data["name"],
        "text": data["text"],
        "time": now()
    }

    messages[rid].append(msg)
    emit("new_message", msg, to=rid)

# ======================
# RUN
# ======================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    socketio.run(app, host="0.0.0.0", port=port)
