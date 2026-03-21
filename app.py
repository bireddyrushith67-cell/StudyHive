from flask import Flask, render_template, request, jsonify, Response
from flask_socketio import SocketIO, emit, join_room, leave_room
from datetime import datetime
import uuid, json as json_lib, os

app = Flask(__name__)
app.secret_key = "studyhive_rushith_2024"
socketio = SocketIO(app, cors_allowed_origins="*")

ADMIN_PASSWORD = "rushithisthegoat"

users = {}
rooms = {}
messages = {}
doubts = []
materials = []
debates = []
tests = []
banned = set()

def make_id(): return str(uuid.uuid4())[:8]
def ts(): return datetime.now().strftime("%H:%M")

def award_xp(uid, amount, reason=""):
    if uid in users:
        users[uid]["xp"] = users[uid].get("xp", 0) + amount
        users[uid]["points"] = users[uid].get("points", 0) + amount
        users[uid]["level"] = users[uid]["xp"] // 100
        socketio.emit("xp_update", {
            "uid": uid,
            "xp": users[uid]["xp"],
            "points": users[uid]["points"],
            "level": users[uid]["level"],
            "reason": reason
        }, to=uid)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/admin")
def admin_page():
    return render_template("admin.html")

@app.route("/manifest.json")
def manifest():
    data = {
        "name": "StudyHive",
        "short_name": "StudyHive",
        "description": "Learn together. Grow together.",
        "start_url": "/",
        "display": "standalone",
        "background_color": "#ffffff",
        "theme_color": "#5b5ef4",
        "orientation": "portrait",
        "icons": [
            {"src": "https://via.placeholder.com/192x192/5b5ef4/ffffff?text=SH", "sizes": "192x192", "type": "image/png"},
            {"src": "https://via.placeholder.com/512x512/5b5ef4/ffffff?text=SH", "sizes": "512x512", "type": "image/png"}
        ]
    }
    return app.response_class(response=json_lib.dumps(data), mimetype="application/json")

@app.route("/api/register", methods=["POST"])
def register():
    d = request.json
    email = d.get("email","").strip().lower()
    name = d.get("name","").strip()
    password = d.get("password","").strip()
    role = d.get("role","student")
    if not email or not name or not password:
        return jsonify({"error":"All fields required"}), 400
    for u in users.values():
        if u["email"] == email:
            return jsonify({"error":"Email already registered"}), 400
    uid = make_id()
    status = "approved" if role == "teacher" else "pending"
    users[uid] = {
        "uid": uid, "name": name, "email": email,
        "password": password, "role": role,
        "status": status, "xp": 0, "points": 0,
        "level": 0, "joined": datetime.now().strftime("%d %b %Y"),
        "warnings": 0
    }
    return jsonify({"uid": uid, "status": status, "name": name, "role": role})

@app.route("/api/login", methods=["POST"])
def login():
    d = request.json
    email = d.get("email","").strip().lower()
    password = d.get("password","").strip()
    if email == "admin" and password == ADMIN_PASSWORD:
        return jsonify({"uid":"admin","name":"Rushith","role":"admin","status":"approved","xp":0,"points":0,"level":99})
    for uid, u in users.items():
        if u["email"] == email and u["password"] == password:
            if uid in banned or u["status"] == "banned":
                return jsonify({"error":"You have been banned from StudyHive."}), 403
            if u["status"] == "pending":
                return jsonify({"error":"Your account is pending admin approval."}), 403
            if u["status"] == "rejected":
                return jsonify({"error":"Your account was rejected. Contact admin."}), 403
            return jsonify({"uid":uid,"name":u["name"],"role":u["role"],"status":u["status"],"xp":u.get("xp",0),"points":u.get("points",0),"level":u.get("level",0)})
    return jsonify({"error":"Invalid email or password"}), 401

@app.route("/api/users")
def get_users():
    return jsonify(list(users.values()))

@app.route("/api/users/<uid>/approve", methods=["POST"])
def approve_user(uid):
    if uid in users:
        users[uid]["status"] = "approved"
        award_xp(uid, 10, "Account approved!")
        socketio.emit("account_approved", {}, to=uid)
    return jsonify({"ok":True})

@app.route("/api/users/<uid>/reject", methods=["POST"])
def reject_user(uid):
    if uid in users:
        users[uid]["status"] = "rejected"
        socketio.emit("account_rejected", {}, to=uid)
    return jsonify({"ok":True})

@app.route("/api/users/<uid>/ban", methods=["POST"])
def ban_user(uid):
    banned.add(uid)
    if uid in users:
        users[uid]["status"] = "banned"
    socketio.emit("force_logout", {"reason":"You have been banned."}, to=uid)
    return jsonify({"ok":True})

@app.route("/api/users/<uid>/unban", methods=["POST"])
def unban_user(uid):
    banned.discard(uid)
    if uid in users:
        users[uid]["status"] = "approved"
    return jsonify({"ok":True})

@app.route("/api/users/<uid>/warn", methods=["POST"])
def warn_user(uid):
    if uid in users:
        users[uid]["warnings"] = users[uid].get("warnings",0) + 1
        socketio.emit("warning", {"message": request.json.get("message","Please follow the rules.")}, to=uid)
    return jsonify({"ok":True})

@app.route("/api/users/<uid>/points", methods=["POST"])
def give_points(uid):
    d = request.json
    award_xp(uid, int(d.get("amount",10)), d.get("reason","Teacher reward"))
    return jsonify({"ok":True})

@app.route("/api/users/<uid>/message", methods=["POST"])
def message_user(uid):
    socketio.emit("admin_message", {"from":"Rushith","message":request.json.get("message","")}, to=uid)
    return jsonify({"ok":True})

@app.route("/api/users/<uid>/setrole", methods=["POST"])
def set_role(uid):
    if uid in users:
        users[uid]["role"] = request.json.get("role","student")
    return jsonify({"ok":True})

@app.route("/api/rooms", methods=["GET"])
def get_rooms():
    return jsonify(list(rooms.values()))

@app.route("/api/rooms", methods=["POST"])
def create_room():
    d = request.json
    rid = make_id()
    room = {"id":rid,"name":d.get("name","Room"),"subject":d.get("subject","General"),"type":d.get("type","text"),"host":d.get("host","Unknown"),"hostId":d.get("hostId",""),"live":True,"members":[],"created":ts()}
    rooms[rid] = room
    messages[rid] = []
    socketio.emit("room_created", room, broadcast=True)
    return jsonify(room), 201

@app.route("/api/rooms/kick_user", methods=["POST"])
def kick_user_from_rooms():
    d = request.json
    socketio.emit("kicked", {"reason":d.get("reason","Kicked by admin")}, to=d.get("uid"))
    return jsonify({"ok":True})

@app.route("/api/doubts", methods=["GET"])
def get_doubts():
    subj = request.args.get("subject")
    result = doubts if not subj or subj=="All" else [d for d in doubts if d["subject"]==subj]
    return jsonify(result)

@app.route("/api/doubts", methods=["POST"])
def post_doubt():
    d = request.json
    doubt = {"id":make_id(),"title":d.get("title",""),"details":d.get("details",""),"subject":d.get("subject","General"),"author":d.get("author","?"),"authorId":d.get("authorId",""),"votes":0,"answered":False,"time":ts()}
    doubts.insert(0, doubt)
    socketio.emit("new_doubt", doubt, broadcast=True)
    return jsonify(doubt), 201

@app.route("/api/doubts/<did>/vote", methods=["POST"])
def vote_doubt(did):
    for d in doubts:
        if d["id"]==did:
            d["votes"] += 1
            return jsonify(d)
    return jsonify({"error":"not found"}), 404

@app.route("/api/doubts/<did>/answer", methods=["POST"])
def answer_doubt(did):
    for d in doubts:
        if d["id"]==did:
            d["answered"] = True
            uid = d.get("authorId")
            if uid: award_xp(uid, 15, "Doubt answered!")
            return jsonify(d)
    return jsonify({"error":"not found"}), 404

@app.route("/api/materials", methods=["GET"])
def get_materials():
    return jsonify(materials)

@app.route("/api/materials", methods=["POST"])
def post_material():
    d = request.json
    mat = {"id":make_id(),"title":d.get("title",""),"subject":d.get("subject",""),"link":d.get("link",""),"desc":d.get("desc",""),"author":d.get("author",""),"authorId":d.get("authorId",""),"role":d.get("role",""),"time":ts()}
    materials.insert(0, mat)
    return jsonify(mat), 201

@app.route("/api/materials/<mid>", methods=["DELETE"])
def delete_material(mid):
    global materials
    materials = [m for m in materials if m["id"]!=mid]
    return jsonify({"ok":True})

@app.route("/api/tests", methods=["GET"])
def get_tests():
    return jsonify(tests)

@app.route("/api/tests", methods=["POST"])
def create_test():
    d = request.json
    test = {"id":make_id(),"title":d.get("title",""),"subject":d.get("subject",""),"author":d.get("author",""),"authorId":d.get("authorId",""),"questions":d.get("questions",[]),"xpReward":int(d.get("xpReward",20)),"time":ts(),"completedBy":[]}
    tests.append(test)
    socketio.emit("new_test", test, broadcast=True)
    return jsonify(test), 201

@app.route("/api/tests/<tid>/submit", methods=["POST"])
def submit_test(tid):
    d = request.json
    uid = d.get("uid")
    answers = d.get("answers",[])
    for t in tests:
        if t["id"]==tid:
            if uid in t["completedBy"]:
                return jsonify({"error":"Already completed"}), 400
            score = sum(1 for i,q in enumerate(t["questions"]) if i<len(answers) and answers[i]==q.get("correct"))
            total = len(t["questions"])
            t["completedBy"].append(uid)
            xp = int(t["xpReward"]*((score/total*100)/100)) if total else 0
            if uid != "admin": award_xp(uid, xp, f"Test: {t['title']} ({score}/{total})")
            return jsonify({"score":score,"total":total,"xp_earned":xp})
    return jsonify({"error":"not found"}), 404

@app.route("/api/debates", methods=["GET"])
def get_debates():
    return jsonify(debates)

@app.route("/api/debates", methods=["POST"])
def create_debate():
    d = request.json
    debate = {"id":make_id(),"topic":d.get("topic",""),"subject":d.get("subject","General"),"author":d.get("author",""),"authorId":d.get("authorId",""),"forVotes":0,"againstVotes":0,"time":ts()}
    debates.insert(0, debate)
    socketio.emit("new_debate", debate, broadcast=True)
    return jsonify(debate), 201

@app.route("/api/debates/<did>/vote", methods=["POST"])
def vote_debate(did):
    side = request.json.get("side","for")
    for d in debates:
        if d["id"]==did:
            if side=="for": d["forVotes"]+=1
            else: d["againstVotes"]+=1
            return jsonify(d)
    return jsonify({"error":"not found"}), 404

online_users = {}

@socketio.on("connect")
def on_connect(): pass

@socketio.on("register_session")
def reg_session(data):
    uid = data.get("uid")
    online_users[request.sid] = uid
    join_room(uid)
    socketio.emit("online_count", len(online_users), broadcast=True)

@socketio.on("disconnect")
def on_disconnect():
    online_users.pop(request.sid, None)
    socketio.emit("online_count", len(online_users), broadcast=True)

@socketio.on("join_room")
def on_join(data):
    rid = data.get("room_id")
    name = data.get("name","?")
    join_room(rid)
    if rid in rooms and name not in rooms[rid]["members"]:
        rooms[rid]["members"].append(name)
    emit("user_joined", {"name":name,"uid":data.get("uid"),"time":ts()}, to=rid)

@socketio.on("leave_room")
def on_leave(data):
    rid = data.get("room_id")
    name = data.get("name","?")
    leave_room(rid)
    if rid in rooms and name in rooms[rid]["members"]:
        rooms[rid]["members"].remove(name)
    emit("user_left", {"name":name}, to=rid)

@socketio.on("send_message")
def on_message(data):
    rid = data.get("room_id")
    uid = data.get("uid","")
    msg = {"id":make_id(),"text":data.get("text",""),"name":data.get("name","?"),"uid":uid,"role":data.get("role","student"),"time":ts(),"room_id":rid}
    if rid not in messages: messages[rid]=[]
    messages[rid].append(msg)
    emit("new_message", msg, to=rid)
    if uid and uid != "admin": award_xp(uid, 1, "Sent a message")

@socketio.on("get_messages")
def get_msgs(data):
    rid = data.get("room_id","general")
    emit("message_history", messages.get(rid,[]))

if __name__ == "__main__":
    socketio.run(app, debug=True, port=5000)

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=10000)