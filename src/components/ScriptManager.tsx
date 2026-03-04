import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { Question, LeadStatus } from '../types';
import { DEFAULT_QUESTIONS, INITIAL_STATUSES } from '../constants';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Plus, Save, Tag, Settings2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface SortableItemProps {
  question: Question;
  onRemove: (id: string) => void;
  onUpdate: (id: string, text: string) => void;
}

const SortableQuestion: React.FC<SortableItemProps> = ({ question, onRemove, onUpdate }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-xl mb-2 group",
        isDragging && "shadow-lg border-indigo-300 ring-2 ring-indigo-100"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-600 mt-1"
      >
        <GripVertical size={20} />
      </button>
      
      <textarea
        value={question.text}
        onChange={(e) => onUpdate(question.id, e.target.value)}
        className="flex-1 bg-transparent border-none focus:ring-0 text-slate-700 placeholder:text-slate-300 resize-none min-h-[24px] max-h-[120px]"
        placeholder="Digite sua pergunta aqui..."
        rows={1}
        onInput={(e) => {
          const target = e.target as HTMLTextAreaElement;
          target.style.height = 'auto';
          target.style.height = Math.min(target.scrollHeight, 120) + 'px';
        }}
      />

      <button
        onClick={() => onRemove(question.id)}
        className="p-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity mt-1"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
};

export function ScriptManager() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [statuses, setStatuses] = useState<LeadStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const storedQuestions = await db.questions.orderBy('order').toArray();
    if (storedQuestions.length === 0) {
      setQuestions(DEFAULT_QUESTIONS);
      try {
        await db.questions.bulkPut(DEFAULT_QUESTIONS);
      } catch (e) {
        console.warn('Questions already seeded', e);
      }
    } else {
      setQuestions(storedQuestions);
    }

    const storedStatuses = await db.statuses.toArray();
    if (storedStatuses.length === 0) {
      setStatuses(INITIAL_STATUSES);
      try {
        await db.statuses.bulkPut(INITIAL_STATUSES);
      } catch (e) {
        console.warn('Statuses already seeded', e);
      }
    } else {
      setStatuses(storedStatuses);
    }

    setLoading(false);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setQuestions((items: Question[]) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newArray = arrayMove(items, oldIndex, newIndex);
        
        // Update orders in DB
        const updated: Question[] = newArray.map((q: Question, idx: number) => ({
          id: q.id,
          text: q.text,
          order: idx
        }));
        db.questions.bulkPut(updated);
        
        return updated;
      });
    }
  }

  // Question handlers
  async function addQuestion() {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      text: '',
      order: questions.length
    };
    const updated = [...questions, newQuestion];
    setQuestions(updated);
    await db.questions.add(newQuestion);
  }

  async function removeQuestion(id: string) {
    const updated = questions.filter(q => q.id !== id);
    setQuestions(updated);
    await db.questions.delete(id);
  }

  async function updateQuestion(id: string, text: string) {
    const updated = questions.map(q => q.id === id ? { ...q, text } : q);
    setQuestions(updated);
    await db.questions.update(id, { text });
  }

  // Status handlers
  async function addStatus() {
    const newStatus: LeadStatus = {
      id: crypto.randomUUID(),
      label: 'Novo Status',
      color: '#6366f1'
    };
    setStatuses([...statuses, newStatus]);
    await db.statuses.add(newStatus);
  }

  async function removeStatus(id: string) {
    const updated = statuses.filter(s => s.id !== id);
    setStatuses(updated);
    await db.statuses.delete(id);
  }

  async function updateStatus(id: string, updates: Partial<LeadStatus>) {
    const updated = statuses.map(s => s.id === id ? { ...s, ...updates } : s);
    setStatuses(updated);
    await db.statuses.update(id, updates);
  }

  if (loading) return <div className="p-8 text-center text-slate-500">Carregando configurações...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-12">
      {/* Questions Section */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Settings2 className="text-indigo-600" size={24} />
              Script de Vendas
            </h2>
            <p className="text-slate-500">Defina as perguntas que serão feitas aos leads.</p>
          </div>
          <button onClick={addQuestion} className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            Nova Pergunta
          </button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={questions.map(q => q.id)}
            strategy={verticalListSortingStrategy}
          >
            {questions.map((question) => (
              <SortableQuestion
                key={question.id}
                question={question}
                onRemove={removeQuestion}
                onUpdate={updateQuestion}
              />
            ))}
          </SortableContext>
        </DndContext>

        {questions.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
            Nenhuma pergunta cadastrada.
          </div>
        )}
      </section>

      {/* Statuses Section */}
      <section className="pt-12 border-t border-slate-200">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Tag className="text-indigo-600" size={24} />
              Status de Lead
            </h2>
            <p className="text-slate-500">Gerencie as opções de status disponíveis para os leads.</p>
          </div>
          <button onClick={addStatus} className="btn-secondary flex items-center gap-2">
            <Plus size={20} />
            Novo Status
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {statuses.map((status) => (
            <div 
              key={status.id}
              className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl group"
            >
              <input
                type="color"
                value={status.color}
                onChange={(e) => updateStatus(status.id, { color: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer border-none bg-transparent"
              />
              <input
                type="text"
                value={status.label}
                onChange={(e) => updateStatus(status.id, { label: e.target.value })}
                className="flex-1 bg-transparent border-none focus:ring-0 text-slate-700 font-medium"
                placeholder="Nome do status..."
              />
              <button
                onClick={() => removeStatus(status.id)}
                className="p-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {statuses.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
            Nenhum status cadastrado.
          </div>
        )}
      </section>
    </div>
  );
}
