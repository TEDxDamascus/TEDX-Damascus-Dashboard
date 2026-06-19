import { useState } from 'react';
import { QuizOutlined, LockOutlined, DragIndicator } from '@mui/icons-material';
import QuestionCard from './QuestionCard';
import AddQuestionPanel from './AddQuestionPanel';

// ── SectionBlock ──────────────────────────────────────────────────────────────
function SectionBlock({
  section,
  childQuestions,
  sectionIndex,
  totalSections,
  isPublished,
  removingId,
  flatQuestions,
  lastAddedIndex,
  onUpdate,
  onRemove,
  onMoveSectionUp,
  onMoveSectionDown,
}) {
  const [dragId, setDragId] = useState(null);
  const [overId, setOverId] = useState(null);

  const sorted = [...childQuestions].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));

  const handleDragStart = (e, id) => {
    e.dataTransfer.setData('qid', id);
    e.dataTransfer.effectAllowed = 'move';
    setDragId(id);
  };

  const handleDragOver = (e, id) => {
    e.preventDefault();
    if (id !== dragId) setOverId(id);
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    const srcId = e.dataTransfer.getData('qid');
    if (!srcId || srcId === targetId) {
      setDragId(null);
      setOverId(null);
      return;
    }
    const list = sorted.filter((q) => q.id !== srcId);
    const tIdx = list.findIndex((q) => q.id === targetId);
    const src = sorted.find((q) => q.id === srcId);
    if (tIdx === -1) {
      list.push(src);
    } else {
      list.splice(tIdx, 0, src);
    }
    list.forEach((q, idx) => {
      if (q.orderIndex !== idx) onUpdate(q.id, { ...q, orderIndex: idx });
    });
    setDragId(null);
    setOverId(null);
  };

  const handleDragEnd = () => {
    setDragId(null);
    setOverId(null);
  };

  return (
    <div className="overflow-hidden rounded-xl border-2 border-tedx-red bg-white">
      {/* Section card — title / help text / delete / up-down */}
      <QuestionCard
        question={section}
        index={sectionIndex}
        total={totalSections}
        defaultExpanded={flatQuestions.findIndex((x) => x.id === section.id) === lastAddedIndex}
        readOnly={isPublished}
        parentSection={null}
        onUpdate={onUpdate}
        onRemove={onRemove}
        isRemoving={removingId === section.id}
        onMoveUp={() => onMoveSectionUp(sectionIndex)}
        onMoveDown={() => onMoveSectionDown(sectionIndex)}
      />

      {/* Children nested inside the section */}
      {sorted.length > 0 ? (
        <div className="mx-3 mb-3 mt-1 space-y-2 border-t border-red-100 pt-2">
          {sorted.map((q, i) => (
            <div
              key={q.id}
              draggable={!isPublished}
              onDragStart={(e) => handleDragStart(e, q.id)}
              onDragOver={(e) => handleDragOver(e, q.id)}
              onDrop={(e) => handleDrop(e, q.id)}
              onDragEnd={handleDragEnd}
              className={[
                'flex items-start gap-1.5 rounded-lg transition-colors',
                overId === q.id && dragId !== q.id
                  ? 'bg-red-50 outline outline-2 outline-tedx-red'
                  : '',
                dragId === q.id ? 'opacity-40' : '',
              ].join(' ')}
            >
              {!isPublished && (
                <span className="mt-3 flex-shrink-0 cursor-grab text-gray-300 hover:text-gray-500 active:cursor-grabbing">
                  <DragIndicator style={{ fontSize: 18 }} />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <QuestionCard
                  question={q}
                  index={i}
                  total={sorted.length}
                  defaultExpanded={flatQuestions.findIndex((x) => x.id === q.id) === lastAddedIndex}
                  readOnly={isPublished}
                  parentSection={section}
                  hideMoveButtons
                  onUpdate={onUpdate}
                  onRemove={onRemove}
                  isRemoving={removingId === q.id}
                  onMoveUp={() => {}}
                  onMoveDown={() => {}}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="px-4 pb-3 pt-1 text-xs italic text-red-300">
          No questions in this section yet. Use &ldquo;Add Question&rdquo; below and select this
          section as the parent.
        </p>
      )}
    </div>
  );
}

// ── QuestionList ──────────────────────────────────────────────────────────────
export default function QuestionList({
  questions,
  lastAddedIndex,
  isPublished,
  isAddingQuestion,
  onAdd,
  onUpdate,
  onRemove,
}) {
  const [removingId, setRemovingId] = useState(null);
  const [standaloneDragId, setStandaloneDragId] = useState(null);
  const [standaloneOverId, setStandaloneOverId] = useState(null);

  const handleRemove = async (id) => {
    setRemovingId(id);
    await onRemove(id);
    setRemovingId(null);
  };

  // Build section list and children map
  const sections = questions
    .filter((q) => q.type === 'section')
    .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));

  const childrenBySection = Object.fromEntries(sections.map((s) => [s.id, []]));
  questions.forEach((q) => {
    if (q.type !== 'section' && q.parentId && childrenBySection[q.parentId] !== undefined) {
      childrenBySection[q.parentId].push(q);
    }
  });

  // Questions with no section parent
  const standalone = questions
    .filter((q) => q.type !== 'section' && !q.parentId)
    .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));

  // Section-level reordering (up/down via the QuestionCard arrows)
  const handleMoveSectionUp = (sectionIdx) => {
    if (sectionIdx === 0) return;
    const a = sections[sectionIdx];
    const b = sections[sectionIdx - 1];
    onUpdate(a.id, { ...a, orderIndex: b.orderIndex });
    onUpdate(b.id, { ...b, orderIndex: a.orderIndex });
  };

  const handleMoveSectionDown = (sectionIdx) => {
    if (sectionIdx === sections.length - 1) return;
    const a = sections[sectionIdx];
    const b = sections[sectionIdx + 1];
    onUpdate(a.id, { ...a, orderIndex: b.orderIndex });
    onUpdate(b.id, { ...b, orderIndex: a.orderIndex });
  };

  // Standalone DnD handlers
  const handleStandaloneDragStart = (e, id) => {
    e.dataTransfer.setData('qid', id);
    e.dataTransfer.effectAllowed = 'move';
    setStandaloneDragId(id);
  };

  const handleStandaloneDragOver = (e, id) => {
    e.preventDefault();
    if (id !== standaloneDragId) setStandaloneOverId(id);
  };

  const handleStandaloneDrop = (e, targetId) => {
    e.preventDefault();
    const srcId = e.dataTransfer.getData('qid');
    if (!srcId || srcId === targetId) {
      setStandaloneDragId(null);
      setStandaloneOverId(null);
      return;
    }
    const list = standalone.filter((q) => q.id !== srcId);
    const tIdx = list.findIndex((q) => q.id === targetId);
    const src = standalone.find((q) => q.id === srcId);
    if (tIdx === -1) {
      list.push(src);
    } else {
      list.splice(tIdx, 0, src);
    }
    list.forEach((q, idx) => {
      if (q.orderIndex !== idx) onUpdate(q.id, { ...q, orderIndex: idx });
    });
    setStandaloneDragId(null);
    setStandaloneOverId(null);
  };

  const handleStandaloneDragEnd = () => {
    setStandaloneDragId(null);
    setStandaloneOverId(null);
  };

  const isEmpty = questions.length === 0;

  return (
    <div>
      {/* Published warning */}
      {isPublished && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <LockOutlined style={{ fontSize: 18 }} className="shrink-0 text-amber-500" />
          <p className="text-sm text-amber-700">
            This form is <strong>published</strong>. Unpublish it first to add or edit questions.
          </p>
        </div>
      )}

      <div className="mb-4 flex items-center">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Questions
          <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-500">
            {questions.length}
          </span>
        </h3>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center py-12 text-gray-400">
          <QuizOutlined sx={{ fontSize: 56, color: '#d1d5db', mb: 1.5 }} />
          <p className="text-sm">No questions yet. Add one below.</p>
        </div>
      ) : (
        <div className="mb-4 space-y-4">
          {/* Sections with nested children */}
          {sections.map((section, sIdx) => (
            <SectionBlock
              key={section.id}
              section={section}
              childQuestions={childrenBySection[section.id] ?? []}
              sectionIndex={sIdx}
              totalSections={sections.length}
              isPublished={isPublished}
              removingId={removingId}
              flatQuestions={questions}
              lastAddedIndex={lastAddedIndex}
              onUpdate={onUpdate}
              onRemove={handleRemove}
              onMoveSectionUp={handleMoveSectionUp}
              onMoveSectionDown={handleMoveSectionDown}
            />
          ))}

          {/* Standalone questions (no parent section) */}
          {standalone.length > 0 && (
            <div className="space-y-2">
              {sections.length > 0 && (
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Standalone Questions
                </p>
              )}
              {standalone.map((q, i) => (
                <div
                  key={q.id}
                  draggable={!isPublished}
                  onDragStart={(e) => handleStandaloneDragStart(e, q.id)}
                  onDragOver={(e) => handleStandaloneDragOver(e, q.id)}
                  onDrop={(e) => handleStandaloneDrop(e, q.id)}
                  onDragEnd={handleStandaloneDragEnd}
                  className={[
                    'flex items-start gap-1.5 rounded-lg transition-colors',
                    standaloneOverId === q.id && standaloneDragId !== q.id
                      ? 'bg-gray-50 outline outline-2 outline-gray-400'
                      : '',
                    standaloneDragId === q.id ? 'opacity-40' : '',
                  ].join(' ')}
                >
                  {!isPublished && (
                    <span className="mt-3 flex-shrink-0 cursor-grab text-gray-300 hover:text-gray-500 active:cursor-grabbing">
                      <DragIndicator style={{ fontSize: 18 }} />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <QuestionCard
                      question={q}
                      index={i}
                      total={standalone.length}
                      defaultExpanded={questions.findIndex((x) => x.id === q.id) === lastAddedIndex}
                      readOnly={isPublished}
                      parentSection={null}
                      hideMoveButtons
                      onUpdate={onUpdate}
                      onRemove={handleRemove}
                      isRemoving={removingId === q.id}
                      onMoveUp={() => {}}
                      onMoveDown={() => {}}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <AddQuestionPanel
        onAdd={onAdd}
        isAdding={isAddingQuestion}
        disabled={isPublished}
        sections={sections}
      />
    </div>
  );
}
