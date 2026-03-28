/**
 * TaskVault — Full React Native App
 * Works with GitHub Actions → APK
 */

import React, {useState, useEffect, useRef} from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, FlatList, Modal, Switch, Alert, Dimensions,
  PanResponder, StatusBar, Platform, Animated,
} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {width: SW, height: SH} = Dimensions.get('window');

// ─── THEME ───────────────────────────────────────────────────────────────────
const C = {
  bg:      '#0a0a0f',
  surface: '#111118',
  card:    '#16161f',
  border:  '#1e1e2e',
  accent:  '#6c63ff',
  accentL: '#6c63ff33',
  green:   '#22c55e',
  red:     '#ef4444',
  yellow:  '#f59e0b',
  purple:  '#a855f7',
  text:    '#e2e2f0',
  muted:   '#6b6b8a',
  faint:   '#1a1a2a',
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2);
const fmt2 = (n: number) => String(n).padStart(2, '0');

const save = async (key: string, val: any) => {
  try { await AsyncStorage.setItem(key, JSON.stringify(val)); } catch {}
};
const load = async (key: string, def: any) => {
  try {
    const v = await AsyncStorage.getItem(key);
    return v ? JSON.parse(v) : def;
  } catch { return def; }
};

// ─── UI COMPONENTS ───────────────────────────────────────────────────────────
const Card = ({children, style}: any) => (
  <View style={[s.card, style]}>{children}</View>
);

const Pill = ({label, color = C.accent}: {label: string; color?: string}) => (
  <View style={{backgroundColor: color + '22', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1, borderColor: color + '44', marginRight: 4, marginBottom: 2}}>
    <Text style={{color, fontSize: 10, fontWeight: '700'}}>{label}</Text>
  </View>
);

const Btn = ({label, onPress, variant = 'ghost', icon}: any) => {
  const variants: any = {
    accent: {bg: C.accent, color: '#fff'},
    surface: {bg: C.card, color: C.text},
    ghost: {bg: 'transparent', color: C.muted},
    danger: {bg: C.red + '22', color: C.red},
    success: {bg: C.green + '22', color: C.green},
  };
  const v = variants[variant];
  return (
    <TouchableOpacity onPress={onPress} style={{backgroundColor: v.bg, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, borderWidth: variant === 'surface' ? 1 : 0, borderColor: C.border, flexDirection: 'row', alignItems: 'center', gap: 6}}>
      {icon && <Text style={{color: v.color, fontSize: 14}}>{icon}</Text>}
      <Text style={{color: v.color, fontWeight: '600', fontSize: 13}}>{label}</Text>
    </TouchableOpacity>
  );
};

const SectionTitle = ({title}: {title: string}) => (
  <Text style={{color: C.text, fontWeight: '700', fontSize: 16, marginBottom: 12}}>{title}</Text>
);

const Divider = () => <View style={{height: 1, backgroundColor: C.border, marginVertical: 10}} />;

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
function DashboardScreen() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const stats = [
    {label: 'Tasks', val: '248', icon: '✅', color: C.accent},
    {label: 'Done', val: '183', icon: '🏆', color: C.green},
    {label: 'Notes', val: '64', icon: '📝', color: C.purple},
    {label: 'Canvas', val: '12', icon: '🎨', color: C.yellow},
  ];

  const activity = [
    {icon: '✅', text: 'Fixed auth bug', time: '2m ago', color: C.green},
    {icon: '📝', text: 'Added Q4 planning note', time: '18m ago', color: C.purple},
    {icon: '🎨', text: 'Created wireframe canvas', time: '1h ago', color: C.yellow},
    {icon: '🔔', text: 'Alarm set: Standup 10am', time: '3h ago', color: C.accent},
    {icon: '☁️', text: 'Backed up to Google Drive', time: '4h ago', color: C.blue},
  ];

  return (
    <ScrollView style={s.screen} contentContainerStyle={{padding: 16}}>
      {/* Clock */}
      <Card style={{alignItems: 'center', marginBottom: 14, padding: 20}}>
        <Text style={{color: C.muted, fontSize: 11, letterSpacing: 2, marginBottom: 4}}>NOW</Text>
        <Text style={{color: C.text, fontSize: 38, fontWeight: '700', fontVariant: ['tabular-nums']}}>
          {fmt2(time.getHours())}:{fmt2(time.getMinutes())}:{fmt2(time.getSeconds())}
        </Text>
        <Text style={{color: C.muted, fontSize: 12, marginTop: 4}}>
          {time.toLocaleDateString('en', {weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'})}
        </Text>
      </Card>

      {/* Stats grid */}
      <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14}}>
        {stats.map(s2 => (
          <Card key={s2.label} style={{flex: 1, minWidth: (SW - 52) / 2, padding: 14}}>
            <Text style={{fontSize: 22}}>{s2.icon}</Text>
            <Text style={{color: C.text, fontSize: 26, fontWeight: '800', marginTop: 6}}>{s2.val}</Text>
            <Text style={{color: C.muted, fontSize: 11, marginTop: 2}}>{s2.label}</Text>
          </Card>
        ))}
      </View>

      {/* Progress bars */}
      <Card style={{marginBottom: 14}}>
        <SectionTitle title="Today's Progress" />
        {[
          {label: 'Tasks completed', done: 6, total: 9, color: C.accent},
          {label: 'Notes written', done: 2, total: 3, color: C.purple},
          {label: 'Focus hours', done: 3, total: 8, color: C.green},
        ].map(p => (
          <View key={p.label} style={{marginBottom: 12}}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5}}>
              <Text style={{color: C.muted, fontSize: 12}}>{p.label}</Text>
              <Text style={{color: C.text, fontSize: 12, fontWeight: '600'}}>{p.done}/{p.total}</Text>
            </View>
            <View style={{height: 6, backgroundColor: C.faint, borderRadius: 99}}>
              <View style={{height: 6, width: `${(p.done / p.total) * 100}%`, backgroundColor: p.color, borderRadius: 99}} />
            </View>
          </View>
        ))}
      </Card>

      {/* Activity feed */}
      <Card>
        <SectionTitle title="Recent Activity" />
        {activity.map((a, i) => (
          <View key={i} style={{flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10}}>
            <Text style={{fontSize: 16}}>{a.icon}</Text>
            <Text style={{color: C.text, fontSize: 13, flex: 1}}>{a.text}</Text>
            <Text style={{color: C.muted, fontSize: 11}}>{a.time}</Text>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}

// ─── TASKS ───────────────────────────────────────────────────────────────────
type Task = {id: string; title: string; desc: string; priority: string; status: string; due: string; starred: boolean; tags: string[]; notes: string;};

const PCOLOR: any = {urgent: C.red, high: C.yellow, medium: C.accent, low: C.green};

function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState(false);
  const [detail, setDetail] = useState<Task | null>(null);
  const [form, setForm] = useState({title: '', desc: '', priority: 'medium', due: '', tags: '', notes: ''});

  useEffect(() => {
    load('tasks', [
      {id: '1', title: 'Design onboarding flow', desc: 'Wireframes + user interviews', priority: 'high', status: 'in-progress', due: 'Mar 30', starred: true, tags: ['design'], notes: ''},
      {id: '2', title: 'Fix auth bug', desc: 'Token refresh on mobile', priority: 'urgent', status: 'todo', due: 'Mar 28', starred: false, tags: ['bug'], notes: ''},
      {id: '3', title: 'Write API docs', desc: 'Cover all v2 endpoints', priority: 'medium', status: 'done', due: 'Apr 2', starred: false, tags: ['docs'], notes: ''},
    ]).then(setTasks);
  }, []);

  const saveTasks = (t: Task[]) => { setTasks(t); save('tasks', t); };
  const toggle = (id: string) => saveTasks(tasks.map(t => t.id === id ? {...t, status: t.status === 'done' ? 'todo' : 'done'} : t));
  const star = (id: string) => saveTasks(tasks.map(t => t.id === id ? {...t, starred: !t.starred} : t));
  const del = (id: string) => { saveTasks(tasks.filter(t => t.id !== id)); setDetail(null); };

  const addTask = () => {
    if (!form.title.trim()) return;
    const t: Task = {id: uid(), title: form.title, desc: form.desc, priority: form.priority, status: 'todo', due: form.due, starred: false, tags: form.tags ? form.tags.split(',').map(x => x.trim()) : [], notes: form.notes};
    saveTasks([t, ...tasks]);
    setForm({title: '', desc: '', priority: 'medium', due: '', tags: '', notes: ''});
    setModal(false);
  };

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  return (
    <View style={s.screen}>
      {/* Filter bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{maxHeight: 50, borderBottomWidth: 1, borderBottomColor: C.border}} contentContainerStyle={{padding: 10, gap: 6, flexDirection: 'row'}}>
        {['all', 'todo', 'in-progress', 'done'].map(f => (
          <TouchableOpacity key={f} onPress={() => setFilter(f)} style={{paddingHorizontal: 14, paddingVertical: 5, borderRadius: 8, backgroundColor: filter === f ? C.accent : C.faint, borderWidth: 1, borderColor: filter === f ? C.accent : C.border}}>
            <Text style={{color: filter === f ? '#fff' : C.muted, fontSize: 12, fontWeight: '600', textTransform: 'capitalize'}}>{f}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity onPress={() => setModal(true)} style={{paddingHorizontal: 14, paddingVertical: 5, borderRadius: 8, backgroundColor: C.accent, marginLeft: 'auto'}}>
          <Text style={{color: '#fff', fontSize: 12, fontWeight: '700'}}>+ Add Task</Text>
        </TouchableOpacity>
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        contentContainerStyle={{padding: 14, gap: 10}}
        renderItem={({item}) => (
          <TouchableOpacity onPress={() => setDetail(item)}>
            <Card style={{flexDirection: 'row', gap: 12, alignItems: 'flex-start'}}>
              <TouchableOpacity onPress={() => toggle(item.id)} style={{width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: item.status === 'done' ? C.green : C.border, backgroundColor: item.status === 'done' ? C.green : 'transparent', alignItems: 'center', justifyContent: 'center', marginTop: 2}}>
                {item.status === 'done' && <Text style={{color: '#fff', fontSize: 12}}>✓</Text>}
              </TouchableOpacity>
              <View style={{flex: 1}}>
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap'}}>
                  <Text style={{color: item.status === 'done' ? C.muted : C.text, fontWeight: '700', fontSize: 14, textDecorationLine: item.status === 'done' ? 'line-through' : 'none', flex: 1}}>{item.title}</Text>
                  <Pill label={item.priority} color={PCOLOR[item.priority]} />
                </View>
                {item.desc ? <Text style={{color: C.muted, fontSize: 12, marginTop: 3}}>{item.desc}</Text> : null}
                <View style={{flexDirection: 'row', gap: 10, marginTop: 6, flexWrap: 'wrap'}}>
                  {item.tags.map(tag => <Pill key={tag} label={tag} color={C.muted} />)}
                  {item.due ? <Text style={{color: C.muted, fontSize: 11}}>📅 {item.due}</Text> : null}
                </View>
              </View>
              <TouchableOpacity onPress={() => star(item.id)}>
                <Text style={{fontSize: 16}}>{item.starred ? '⭐' : '☆'}</Text>
              </TouchableOpacity>
            </Card>
          </TouchableOpacity>
        )}
      />

      {/* Add Task Modal */}
      <Modal visible={modal} transparent animationType="slide" onRequestClose={() => setModal(false)}>
        <View style={s.modalBg}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>New Task</Text>
            <TextInput placeholder="Title *" placeholderTextColor={C.muted} value={form.title} onChangeText={v => setForm({...form, title: v})} style={s.input} />
            <TextInput placeholder="Description" placeholderTextColor={C.muted} value={form.desc} onChangeText={v => setForm({...form, desc: v})} style={[s.input, {height: 80}]} multiline />
            <TextInput placeholder="Due date (e.g. Mar 30)" placeholderTextColor={C.muted} value={form.due} onChangeText={v => setForm({...form, due: v})} style={s.input} />
            <TextInput placeholder="Tags (comma separated)" placeholderTextColor={C.muted} value={form.tags} onChangeText={v => setForm({...form, tags: v})} style={s.input} />
            <View style={{flexDirection: 'row', gap: 6, marginBottom: 14, flexWrap: 'wrap'}}>
              {['low', 'medium', 'high', 'urgent'].map(p => (
                <TouchableOpacity key={p} onPress={() => setForm({...form, priority: p})} style={{paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, backgroundColor: form.priority === p ? PCOLOR[p] : C.faint}}>
                  <Text style={{color: form.priority === p ? '#fff' : C.muted, fontSize: 12, textTransform: 'capitalize'}}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{flexDirection: 'row', gap: 10}}>
              <TouchableOpacity onPress={addTask} style={{flex: 1, backgroundColor: C.accent, borderRadius: 10, padding: 12, alignItems: 'center'}}>
                <Text style={{color: '#fff', fontWeight: '700'}}>Save Task</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModal(false)} style={{flex: 1, backgroundColor: C.faint, borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: C.border}}>
                <Text style={{color: C.muted, fontWeight: '600'}}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Task Detail Modal */}
      <Modal visible={!!detail} transparent animationType="slide" onRequestClose={() => setDetail(null)}>
        <View style={s.modalBg}>
          <View style={[s.modalBox, {maxHeight: SH * 0.8}]}>
            <ScrollView>
              <Text style={s.modalTitle}>{detail?.title}</Text>
              <View style={{flexDirection: 'row', gap: 6, marginBottom: 10, flexWrap: 'wrap'}}>
                <Pill label={detail?.priority || ''} color={PCOLOR[detail?.priority || 'medium']} />
                <Pill label={detail?.status || ''} color={C.accent} />
                {detail?.due ? <Pill label={`📅 ${detail.due}`} color={C.muted} /> : null}
              </View>
              {detail?.desc ? <Text style={{color: C.muted, fontSize: 13, marginBottom: 14, lineHeight: 20}}>{detail.desc}</Text> : null}
              <Divider />
              <Text style={{color: C.muted, fontSize: 12, marginBottom: 6}}>Notes</Text>
              <Text style={{color: C.text, fontSize: 13, lineHeight: 20}}>{detail?.notes || 'No notes yet.'}</Text>
              <Divider />
              <View style={{flexDirection: 'row', gap: 8, marginTop: 4, flexWrap: 'wrap'}}>
                <Btn label="📎 Attach File" variant="surface" onPress={() => Alert.alert('Attach', 'File picker would open here')} />
                <Btn label="🖼️ Add Image" variant="surface" onPress={() => Alert.alert('Image', 'Image picker would open here')} />
                <Btn label="🗑️ Delete" variant="danger" onPress={() => del(detail!.id)} />
              </View>
            </ScrollView>
            <TouchableOpacity onPress={() => setDetail(null)} style={{marginTop: 16, backgroundColor: C.faint, borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: C.border}}>
              <Text style={{color: C.muted}}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── NOTES ───────────────────────────────────────────────────────────────────
type Note = {id: string; title: string; content: string; color: string; tags: string[]; updated: string;};

const NOTE_COLORS = [C.accent, C.green, C.yellow, C.red, C.purple, '#06b6d4'];

function NotesScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [active, setActive] = useState<Note | null>(null);
  const [showList, setShowList] = useState(true);

  useEffect(() => {
    load('notes', [
      {id: '1', title: 'Q4 Strategy', content: 'Focus on user retention, onboarding improvements, and mobile performance.\n\nKey metrics: DAU, D7 retention, NPS.\n\nPriority:\n- Redesign onboarding\n- Improve load times\n- Launch referral program', color: C.accent, tags: ['strategy'], updated: '2h ago'},
      {id: '2', title: 'Meeting Notes', content: 'Discussed roadmap priorities.\nTeam agreed on shipping v3 by end of April.\n\nAction items:\n- API docs\n- UI audit\n- Performance profiling', color: C.green, tags: ['meeting'], updated: '5h ago'},
      {id: '3', title: 'Book Ideas', content: 'Books to read:\n- Deep Work\n- The Mom Test\n- Shape Up', color: C.yellow, tags: ['personal'], updated: '1d ago'},
    ]).then(d => { setNotes(d); setActive(d[0]); });
  }, []);

  const saveNotes = (n: Note[]) => { setNotes(n); save('notes', n); };
  const addNote = () => {
    const n: Note = {id: uid(), title: 'Untitled', content: '', color: C.accent, tags: [], updated: 'now'};
    const updated = [n, ...notes];
    saveNotes(updated);
    setActive(n);
    setShowList(false);
  };

  const updateActive = (field: string, val: string) => {
    if (!active) return;
    const updated = {...active, [field]: val, updated: 'just now'};
    setActive(updated);
    saveNotes(notes.map(n => n.id === updated.id ? updated : n));
  };

  if (!showList && active) {
    return (
      <View style={s.screen}>
        <View style={{flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: C.border, gap: 10}}>
          <TouchableOpacity onPress={() => setShowList(true)}>
            <Text style={{color: C.accent, fontSize: 16}}>← Back</Text>
          </TouchableOpacity>
          <TextInput value={active.title} onChangeText={v => updateActive('title', v)} style={{flex: 1, color: C.text, fontSize: 16, fontWeight: '700'}} placeholderTextColor={C.muted} />
          <TouchableOpacity onPress={() => { saveNotes(notes.filter(n => n.id !== active.id)); setActive(notes[1] || null); setShowList(true); }}>
            <Text style={{fontSize: 18}}>🗑️</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{maxHeight: 44, borderBottomWidth: 1, borderBottomColor: C.border}} contentContainerStyle={{padding: 8, gap: 8, flexDirection: 'row', alignItems: 'center'}}>
          <Text style={{color: C.muted, fontSize: 12}}>Color:</Text>
          {NOTE_COLORS.map(c => (
            <TouchableOpacity key={c} onPress={() => updateActive('color', c)} style={{width: 22, height: 22, borderRadius: 11, backgroundColor: c, borderWidth: active.color === c ? 3 : 0, borderColor: '#fff'}} />
          ))}
          <TouchableOpacity onPress={() => Alert.alert('Attach', 'File attachment here')} style={{marginLeft: 8, paddingHorizontal: 12, paddingVertical: 4, backgroundColor: C.faint, borderRadius: 8, borderWidth: 1, borderColor: C.border}}>
            <Text style={{color: C.muted, fontSize: 12}}>📎 Attach</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Alert.alert('Image', 'Image picker here')} style={{paddingHorizontal: 12, paddingVertical: 4, backgroundColor: C.faint, borderRadius: 8, borderWidth: 1, borderColor: C.border}}>
            <Text style={{color: C.muted, fontSize: 12}}>🖼️ Image</Text>
          </TouchableOpacity>
        </ScrollView>
        <TextInput
          value={active.content}
          onChangeText={v => updateActive('content', v)}
          style={{flex: 1, padding: 18, color: C.text, fontSize: 14, lineHeight: 24, textAlignVertical: 'top'}}
          multiline
          placeholder="Start writing..."
          placeholderTextColor={C.muted}
        />
        <View style={{padding: 12, borderTopWidth: 1, borderTopColor: C.border, flexDirection: 'row', gap: 8, flexWrap: 'wrap'}}>
          {active.tags.map(t => <Pill key={t} label={t} color={active.color} />)}
          <TouchableOpacity onPress={() => Alert.prompt?.('Add tag', '', tag => { if (tag) updateActive('tags', [...active.tags, tag].join(',')); })}>
            <Text style={{color: C.muted, fontSize: 12}}>+ tag</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={s.screen}>
      <View style={{padding: 14, borderBottomWidth: 1, borderBottomColor: C.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
        <Text style={{color: C.muted, fontSize: 13}}>{notes.length} notes</Text>
        <TouchableOpacity onPress={addNote} style={{backgroundColor: C.accent, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8}}>
          <Text style={{color: '#fff', fontWeight: '700', fontSize: 13}}>+ New Note</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={notes}
        keyExtractor={i => i.id}
        contentContainerStyle={{padding: 14, gap: 10}}
        renderItem={({item}) => (
          <TouchableOpacity onPress={() => { setActive(item); setShowList(false); }}>
            <Card style={{borderLeftWidth: 3, borderLeftColor: item.color}}>
              <Text style={{color: C.text, fontWeight: '700', fontSize: 15, marginBottom: 4}}>{item.title}</Text>
              <Text style={{color: C.muted, fontSize: 12, lineHeight: 18}} numberOfLines={2}>{item.content}</Text>
              <View style={{flexDirection: 'row', gap: 4, marginTop: 8, flexWrap: 'wrap', alignItems: 'center'}}>
                {item.tags.map(t => <Pill key={t} label={t} color={item.color} />)}
                <Text style={{color: C.muted, fontSize: 10, marginLeft: 'auto'}}>{item.updated}</Text>
              </View>
            </Card>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

// ─── CANVAS ───────────────────────────────────────────────────────────────────
function CanvasScreen() {
  const [lines, setLines] = useState<any[]>([]);
  const [currentLine, setCurrentLine] = useState<any[]>([]);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState(C.accent);
  const [size, setSize] = useState(3);
  const [history, setHistory] = useState<any[][]>([]);

  const colors = [C.accent, C.red, C.green, C.yellow, C.purple, '#06b6d4', '#fff', '#f97316'];

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: e => {
      const pt = {x: e.nativeEvent.locationX, y: e.nativeEvent.locationY};
      setCurrentLine([pt]);
    },
    onPanResponderMove: e => {
      const pt = {x: e.nativeEvent.locationX, y: e.nativeEvent.locationY};
      setCurrentLine(prev => [...prev, pt]);
    },
    onPanResponderRelease: () => {
      if (currentLine.length > 1) {
        const newLines = [...lines, {points: currentLine, color: tool === 'eraser' ? C.bg : color, size: tool === 'eraser' ? size * 6 : size}];
        setLines(newLines);
        setHistory(prev => [...prev, lines]);
      }
      setCurrentLine([]);
    },
  });

  const undo = () => {
    if (history.length === 0) return;
    setLines(history[history.length - 1]);
    setHistory(prev => prev.slice(0, -1));
  };

  const pointsToPath = (points: any[]) => {
    if (points.length < 2) return '';
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  };

  return (
    <View style={s.screen}>
      {/* Toolbar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{maxHeight: 54, borderBottomWidth: 1, borderBottomColor: C.border}} contentContainerStyle={{padding: 8, gap: 6, flexDirection: 'row', alignItems: 'center'}}>
        {[{id: 'pen', label: '✏️'}, {id: 'eraser', label: '⬜'}].map(t => (
          <TouchableOpacity key={t.id} onPress={() => setTool(t.id)} style={{padding: 7, borderRadius: 8, backgroundColor: tool === t.id ? C.accentL : C.faint, borderWidth: 1, borderColor: tool === t.id ? C.accent : C.border}}>
            <Text style={{fontSize: 16}}>{t.label}</Text>
          </TouchableOpacity>
        ))}
        <View style={{width: 1, height: 28, backgroundColor: C.border, marginHorizontal: 4}} />
        {colors.map(c => (
          <TouchableOpacity key={c} onPress={() => { setTool('pen'); setColor(c); }} style={{width: 24, height: 24, borderRadius: 12, backgroundColor: c, borderWidth: color === c ? 3 : 1, borderColor: color === c ? '#fff' : C.border}} />
        ))}
        <View style={{width: 1, height: 28, backgroundColor: C.border, marginHorizontal: 4}} />
        <TouchableOpacity onPress={() => setSize(Math.max(1, size - 1))} style={{padding: 7, backgroundColor: C.faint, borderRadius: 8}}><Text style={{color: C.text}}>−</Text></TouchableOpacity>
        <Text style={{color: C.text, fontSize: 12, minWidth: 20, textAlign: 'center'}}>{size}</Text>
        <TouchableOpacity onPress={() => setSize(Math.min(20, size + 1))} style={{padding: 7, backgroundColor: C.faint, borderRadius: 8}}><Text style={{color: C.text}}>+</Text></TouchableOpacity>
        <View style={{width: 1, height: 28, backgroundColor: C.border, marginHorizontal: 4}} />
        <TouchableOpacity onPress={undo} style={{padding: 7, backgroundColor: C.faint, borderRadius: 8, borderWidth: 1, borderColor: C.border}}><Text style={{color: C.muted, fontSize: 12}}>↩ Undo</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => { setLines([]); setHistory([]); }} style={{padding: 7, backgroundColor: C.red + '22', borderRadius: 8, borderWidth: 1, borderColor: C.red + '44'}}><Text style={{color: C.red, fontSize: 12}}>🗑️ Clear</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => Alert.alert('Attach', 'File/image attachment here')} style={{padding: 7, backgroundColor: C.faint, borderRadius: 8, borderWidth: 1, borderColor: C.border}}><Text style={{color: C.muted, fontSize: 12}}>📎</Text></TouchableOpacity>
      </ScrollView>

      {/* Drawing area */}
      <View style={{flex: 1, backgroundColor: '#0e0e18'}} {...panResponder.panHandlers}>
        {/* Grid dots */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {Array.from({length: Math.ceil(SH / 40)}).map((_, row) =>
            Array.from({length: Math.ceil(SW / 40)}).map((_, col) => (
              <View key={`${row}-${col}`} style={{position: 'absolute', width: 1, height: 1, backgroundColor: '#1a1a2a', top: row * 40, left: col * 40}} />
            ))
          )}
        </View>

        {/* Drawn lines as SVG-like views */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {[...lines, currentLine.length > 1 ? {points: currentLine, color, size} : null].filter(Boolean).map((line: any, i) =>
            line.points.slice(1).map((_: any, j: number) => {
              const p1 = line.points[j];
              const p2 = line.points[j + 1];
              const dx = p2.x - p1.x;
              const dy = p2.y - p1.y;
              const len = Math.sqrt(dx * dx + dy * dy);
              const angle = Math.atan2(dy, dx) * 180 / Math.PI;
              return (
                <View key={`${i}-${j}`} style={{position: 'absolute', left: p1.x, top: p1.y - line.size / 2, width: len, height: line.size, backgroundColor: line.color, borderRadius: line.size, transform: [{rotate: `${angle}deg`}, {translateX: 0}], transformOrigin: '0 50%'}} />
              );
            })
          )}
        </View>

        {/* Canvas info */}
        <View style={{position: 'absolute', bottom: 14, right: 14, backgroundColor: C.card + 'ee', borderRadius: 10, padding: 8, borderWidth: 1, borderColor: C.border}}>
          <Text style={{color: C.muted, fontSize: 10}}>Infinite Canvas • {tool} • {size}px</Text>
        </View>
        <View style={{position: 'absolute', top: 14, left: 14, backgroundColor: C.card + 'dd', borderRadius: 10, padding: 8, borderWidth: 1, borderColor: C.border}}>
          <Text style={{color: C.muted, fontSize: 10}}>💡 Draw freely · 📎 Attach files · 🖼️ Drop images</Text>
        </View>
      </View>
    </View>
  );
}

// ─── ALARMS ───────────────────────────────────────────────────────────────────
type Alarm = {id: string; time: string; label: string; days: string[]; on: boolean;};

function AlarmsScreen() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({time: '', label: '', days: [] as string[]});
  const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  useEffect(() => {
    load('alarms', [
      {id: '1', time: '09:00', label: 'Morning Standup', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], on: true},
      {id: '2', time: '14:30', label: 'Design Review', days: ['Mon', 'Wed'], on: true},
      {id: '3', time: '18:00', label: 'End of Day', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], on: false},
    ]).then(setAlarms);
  }, []);

  const saveAlarms = (a: Alarm[]) => { setAlarms(a); save('alarms', a); };
  const toggle = (id: string) => saveAlarms(alarms.map(a => a.id === id ? {...a, on: !a.on} : a));

  const addAlarm = () => {
    if (!form.time || !form.label) return;
    saveAlarms([...alarms, {id: uid(), ...form, on: true}]);
    setForm({time: '', label: '', days: []});
    setModal(false);
  };

  const toggleDay = (d: string) => setForm(f => ({...f, days: f.days.includes(d) ? f.days.filter(x => x !== d) : [...f.days, d]}));

  return (
    <View style={s.screen}>
      <View style={{padding: 14, borderBottomWidth: 1, borderBottomColor: C.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
        <Text style={{color: C.muted, fontSize: 13}}>Active: {alarms.filter(a => a.on).length}</Text>
        <TouchableOpacity onPress={() => setModal(true)} style={{backgroundColor: C.accent, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8}}>
          <Text style={{color: '#fff', fontWeight: '700'}}>+ New Alarm</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={alarms}
        keyExtractor={i => i.id}
        contentContainerStyle={{padding: 14, gap: 10}}
        renderItem={({item}) => (
          <Card style={{flexDirection: 'row', alignItems: 'center', gap: 14, opacity: item.on ? 1 : 0.5}}>
            <Text style={{fontSize: 24}}>⏰</Text>
            <View style={{flex: 1}}>
              <Text style={{color: C.text, fontSize: 30, fontWeight: '800', letterSpacing: -1}}>{item.time}</Text>
              <Text style={{color: C.muted, fontSize: 13, marginTop: 2}}>{item.label}</Text>
              <View style={{flexDirection: 'row', gap: 4, marginTop: 6, flexWrap: 'wrap'}}>
                {item.days.map(d => <Pill key={d} label={d} color={item.on ? C.accent : C.muted} />)}
              </View>
            </View>
            <View style={{gap: 10, alignItems: 'flex-end'}}>
              <Switch value={item.on} onValueChange={() => toggle(item.id)} trackColor={{false: C.faint, true: C.accent}} thumbColor={item.on ? '#fff' : C.muted} />
              <TouchableOpacity onPress={() => saveAlarms(alarms.filter(a => a.id !== item.id))}>
                <Text style={{fontSize: 16}}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}
      />
      <Modal visible={modal} transparent animationType="slide" onRequestClose={() => setModal(false)}>
        <View style={s.modalBg}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>New Alarm</Text>
            <TextInput placeholder="Time (HH:MM)" placeholderTextColor={C.muted} value={form.time} onChangeText={v => setForm({...form, time: v})} style={s.input} keyboardType="numeric" />
            <TextInput placeholder="Label" placeholderTextColor={C.muted} value={form.label} onChangeText={v => setForm({...form, label: v})} style={s.input} />
            <Text style={{color: C.muted, fontSize: 12, marginBottom: 8}}>Repeat days:</Text>
            <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16}}>
              {allDays.map(d => (
                <TouchableOpacity key={d} onPress={() => toggleDay(d)} style={{paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, backgroundColor: form.days.includes(d) ? C.accent : C.faint, borderWidth: 1, borderColor: form.days.includes(d) ? C.accent : C.border}}>
                  <Text style={{color: form.days.includes(d) ? '#fff' : C.muted, fontSize: 12}}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{flexDirection: 'row', gap: 10}}>
              <TouchableOpacity onPress={addAlarm} style={{flex: 1, backgroundColor: C.accent, borderRadius: 10, padding: 12, alignItems: 'center'}}>
                <Text style={{color: '#fff', fontWeight: '700'}}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModal(false)} style={{flex: 1, backgroundColor: C.faint, borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: C.border}}>
                <Text style={{color: C.muted}}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── CALENDAR ────────────────────────────────────────────────────────────────
function CalendarScreen() {
  const [month, setMonth] = useState(new Date(2026, 2, 1));
  const events: any = {
    '2026-03-28': [{title: 'Standup', color: C.accent}],
    '2026-03-30': [{title: 'Design Review', color: C.yellow}, {title: 'Client Call', color: C.green}],
    '2026-04-02': [{title: 'v2.4 Launch', color: C.red}],
  };

  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const today = new Date();
  const dayW = (SW - 32) / 7;

  const key = (d: number) => `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const isToday = (d: number) => d === today.getDate() && month.getMonth() === today.getMonth() && month.getFullYear() === today.getFullYear();

  return (
    <ScrollView style={s.screen} contentContainerStyle={{padding: 14}}>
      {/* Header */}
      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16}}>
        <TouchableOpacity onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1))} style={{padding: 8, backgroundColor: C.faint, borderRadius: 8}}><Text style={{color: C.text}}>‹</Text></TouchableOpacity>
        <Text style={{color: C.text, fontWeight: '700', fontSize: 17}}>{month.toLocaleString('default', {month: 'long', year: 'numeric'})}</Text>
        <TouchableOpacity onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1))} style={{padding: 8, backgroundColor: C.faint, borderRadius: 8}}><Text style={{color: C.text}}>›</Text></TouchableOpacity>
      </View>

      {/* Day headers */}
      <View style={{flexDirection: 'row', marginBottom: 8}}>
        {['S','M','T','W','T','F','S'].map((d, i) => (
          <View key={i} style={{width: dayW, alignItems: 'center'}}>
            <Text style={{color: C.muted, fontSize: 11, fontWeight: '600'}}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Grid */}
      <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
        {Array.from({length: firstDay}).map((_, i) => <View key={`e${i}`} style={{width: dayW, height: 70}} />)}
        {Array.from({length: daysInMonth}).map((_, i) => {
          const d = i + 1;
          const k = key(d);
          const evs = events[k] || [];
          return (
            <View key={d} style={{width: dayW, height: 70, padding: 3}}>
              <View style={{flex: 1, backgroundColor: C.faint, borderRadius: 8, padding: 4, borderWidth: 1, borderColor: isToday(d) ? C.accent : 'transparent'}}>
                <Text style={{color: isToday(d) ? C.accent : C.text, fontSize: 12, fontWeight: isToday(d) ? '800' : '400', textAlign: 'center', marginBottom: 2}}>{d}</Text>
                {evs.slice(0, 2).map((e: any, j: number) => (
                  <View key={j} style={{backgroundColor: e.color + '33', borderRadius: 3, padding: 1, marginBottom: 1}}>
                    <Text style={{color: e.color, fontSize: 8}} numberOfLines={1}>{e.title}</Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </View>

      {/* Upcoming */}
      <Card style={{marginTop: 16}}>
        <SectionTitle title="Upcoming" />
        {[
          {date: 'Mar 28', title: 'Standup', time: '10:00 AM', color: C.accent},
          {date: 'Mar 30', title: 'Design Review', time: '2:00 PM', color: C.yellow},
          {date: 'Apr 2', title: 'v2.4 Launch', time: 'All day', color: C.red},
        ].map((e, i) => (
          <View key={i} style={{flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 12}}>
            <View style={{width: 3, height: 40, borderRadius: 99, backgroundColor: e.color}} />
            <View>
              <Text style={{color: C.text, fontWeight: '600', fontSize: 13}}>{e.title}</Text>
              <Text style={{color: C.muted, fontSize: 11}}>{e.date} · {e.time}</Text>
            </View>
          </View>
        ))}
        <TouchableOpacity style={{backgroundColor: C.accent, borderRadius: 10, padding: 10, alignItems: 'center'}}>
          <Text style={{color: '#fff', fontWeight: '700', fontSize: 13}}>+ Add Event</Text>
        </TouchableOpacity>
      </Card>
    </ScrollView>
  );
}

// ─── NAVIGATION ───────────────────────────────────────────────────────────────
const Tab = createBottomTabNavigator();

const tabIcon: any = {
  Dashboard: '🏠', Tasks: '✅', Notes: '📝',
  Canvas: '🎨', Calendar: '📅', Alarms: '⏰',
};

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <Tab.Navigator
        screenOptions={({route}) => ({
          tabBarIcon: ({focused}) => (
            <Text style={{fontSize: 20, opacity: focused ? 1 : 0.5}}>{tabIcon[route.name]}</Text>
          ),
          tabBarLabel: ({focused}) => (
            <Text style={{color: focused ? C.accent : C.muted, fontSize: 10, fontWeight: focused ? '700' : '400'}}>{route.name}</Text>
          ),
          tabBarStyle: {backgroundColor: C.surface, borderTopColor: C.border, height: 60, paddingBottom: 8},
          tabBarActiveTintColor: C.accent,
          headerStyle: {backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border, elevation: 0, shadowOpacity: 0},
          headerTintColor: C.text,
          headerTitleStyle: {fontWeight: '700', fontSize: 17},
        })}>
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="Tasks" component={TasksScreen} />
        <Tab.Screen name="Notes" component={NotesScreen} />
        <Tab.Screen name="Canvas" component={CanvasScreen} />
        <Tab.Screen name="Calendar" component={CalendarScreen} />
        <Tab.Screen name="Alarms" component={AlarmsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen: {flex: 1, backgroundColor: C.bg},
  card: {backgroundColor: C.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: C.border},
  input: {backgroundColor: C.faint, borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, color: C.text, fontSize: 13, marginBottom: 10},
  modalBg: {flex: 1, backgroundColor: '#000000aa', justifyContent: 'flex-end'},
  modalBox: {backgroundColor: C.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, borderWidth: 1, borderColor: C.border},
  modalTitle: {color: C.text, fontSize: 18, fontWeight: '800', marginBottom: 16},
});

