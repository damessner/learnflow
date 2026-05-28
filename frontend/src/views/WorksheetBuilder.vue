<template>
  <div class="page builder-page">
    <div class="builder-layout">
      <!-- ===== Left Sidebar (sticky) ===== -->
      <aside class="builder-sidebar">
        <!-- Header row -->
        <div class="sidebar-header" style="gap: 0.35rem">
          <div class="sidebar-header-title">
            <h2 style="font-size: 1.1rem; white-space: nowrap">{{ isEditing ? '✏️ Edit' : '📝 New' }}</h2>
          </div>
          <div style="display:flex;gap:0.35rem;flex-shrink:0">
            <button class="btn-secondary" @click="goToPreview" style="padding:0.4rem 0.5rem;font-size:0.75rem;font-weight:600">Preview</button>
            <button class="btn-primary" @click="save" style="padding:0.4rem 0.5rem;font-size:0.75rem;font-weight:600">Save</button>
          </div>
        </div>

        <!-- Settings (collapsible) -->
        <div class="sidebar-section" style="margin-bottom:0">
          <button class="collapse-toggle" @click="titlePanelOpen = !titlePanelOpen">
            <span class="collapse-toggle-label">📋 Worksheet Settings</span>
            <span class="collapse-arrow" :class="{ open: titlePanelOpen }">▾</span>
          </button>
          <div class="card sidebar-card" style="margin-top:0.25rem">
            <div style="display:flex;align-items:center;justify-content:space-between;background:var(--primary-light);border:1px solid var(--primary-soft);border-radius:var(--radius-sm);padding:0.4rem 0.6rem;margin-bottom:0.5rem;font-size:0.75rem;font-weight:600;color:var(--primary)">
              <span>⏱️ Est. Pupil Time:</span>
              <span>{{ estimatedTimeFormatted }}</span>
            </div>
            <div class="form-group" style="margin-bottom:0.35rem">
              <label>Title</label>
              <input v-model="form.title" placeholder="Worksheet title" />
            </div>
            <div v-show="titlePanelOpen">
              <div style="display:flex;gap:0.5rem">
                <div class="form-group" style="flex:1">
                  <label>Subject</label>
                  <select v-model="form.subject">
                    <option value="">-- Select --</option>
                    <option v-for="s in subjects" :key="s" :value="s">{{ s }}</option>
                  </select>
                </div>
                <div class="form-group" style="flex:1">
                  <label>Grade</label>
                  <select v-model="form.grade_level">
                    <option value="">-- Select --</option>
                    <option v-for="g in gradeLevels" :key="g" :value="g">Klasse {{ g }}</option>
                  </select>
                </div>
              </div>
              <div class="form-group" style="margin-bottom:0">
                <label>Description</label>
                <textarea v-model="form.description" rows="2" placeholder="Optional description" @input="autoExpand($event)"></textarea>
              </div>
              <div v-if="isLanguageSubject" style="display:flex;gap:0.5rem;margin-top:0.5rem">
                <div class="form-group" style="flex:1">
                  <label>Source Lang</label>
                  <select v-model="form.source_lang" style="font-size:0.75rem">
                    <option value="">-- Auto --</option>
                    <option value="de">Deutsch</option>
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                    <option value="es">Español</option>
                    <option value="it">Italiano</option>
                    <option value="nl">Nederlands</option>
                    <option value="ru">Русский</option>
                  </select>
                </div>
                <div class="form-group" style="flex:1">
                  <label>Target Lang</label>
                  <select v-model="form.target_lang" style="font-size:0.75rem">
                    <option value="">-- Auto --</option>
                    <option value="de">Deutsch</option>
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                    <option value="es">Español</option>
                    <option value="it">Italiano</option>
                    <option value="nl">Nederlands</option>
                    <option value="ru">Русский</option>
                  </select>
                </div>
              </div>
              <div v-if="isLanguageSubject" class="form-group" style="margin-bottom:0">
                <label>CEFR Level</label>
                <select v-model="form.cefr_level" style="font-size:0.75rem">
                  <option value="">-- Auto --</option>
                  <option value="A1">A1 – Beginner</option>
                  <option value="A2">A2 – Elementary</option>
                  <option value="B1">B1 – Intermediate</option>
                  <option value="B2">B2 – Upper Intermediate</option>
                  <option value="C1">C1 – Advanced</option>
                  <option value="C2">C2 – Proficient</option>
                </select>
              </div>
              <div class="form-group" style="margin-top:0.5rem; margin-bottom:0">
                <label>Pupil Target Speed</label>
                <select v-model="form.pupil_profile" style="font-size:0.75rem">
                  <option value="default">Default Pupil (Average)</option>
                  <option value="slow">Slow Worker (+50%)</option>
                  <option value="fast">Fast Worker (-30%)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- AI Generator (collapsible) -->
        <div class="sidebar-section">
          <button class="collapse-toggle" @click="aiPanelOpen = !aiPanelOpen">
            <span class="collapse-toggle-label">🤖 AI Generator</span>
            <span class="collapse-arrow" :class="{ open: aiPanelOpen }">▾</span>
          </button>
          <div v-show="aiPanelOpen" class="collapse-content">
            <!-- Tabs -->
            <div style="display: flex; border-bottom: 1px solid var(--border-color); margin-bottom: 0.75rem">
              <button
                type="button"
                style="flex: 1; padding: 0.4rem; font-size: 0.72rem; font-weight: 600; border: none; background: none; border-bottom: 2px solid transparent; cursor: pointer; color: var(--text-muted)"
                :style="{ borderBottomColor: aiTab === 'generate' ? 'var(--primary)' : 'transparent', color: aiTab === 'generate' ? 'var(--primary)' : 'var(--text-muted)' }"
                @click="aiTab = 'generate'"
              >
                ✨ Worksheet
              </button>
              <button
                type="button"
                style="flex: 1; padding: 0.4rem; font-size: 0.72rem; font-weight: 600; border: none; background: none; border-bottom: 2px solid transparent; cursor: pointer; color: var(--text-muted)"
                :style="{ borderBottomColor: aiTab === 'differentiate' ? 'var(--primary)' : 'transparent', color: aiTab === 'differentiate' ? 'var(--primary)' : 'var(--text-muted)' }"
                @click="aiTab = 'differentiate'"
              >
                🔀 Differentiate
              </button>
            </div>

            <!-- Tab 1: Generate Worksheet -->
            <div v-show="aiTab === 'generate'">
              <!-- Expose aiProvider selection -->
              <div class="form-group" style="margin-bottom: 0.5rem">
                <label style="font-size: 0.65rem">AI Provider</label>
                <select v-model="aiProvider" style="font-size: 0.7rem; padding: 0.25rem">
                  <option value="gemini">Google Gemini 2.0 Flash</option>
                  <option value="opencode">OpenCode AI Client</option>
                </select>
              </div>

              <!-- Prompt suggestion chips -->
              <label style="font-size: 0.65rem; color: var(--text-muted); display: block; margin-bottom: 0.15rem">Quick Suggestions</label>
              <div style="display: flex; gap: 0.25rem; flex-wrap: wrap; margin-bottom: 0.5rem">
                <button
                   type="button"
                   style="font-size: 0.62rem; padding: 0.15rem 0.35rem; border-radius: 4px; border: 1px solid var(--border-color); background: var(--bg-main); color: var(--text-main); cursor: pointer"
                   @click="applySuggestion('Create a vocabulary quiz matching English to German terms')"
                >
                  📚 Vocabulary
                </button>
                <button
                   type="button"
                   style="font-size: 0.62rem; padding: 0.15rem 0.35rem; border-radius: 4px; border: 1px solid var(--border-color); background: var(--bg-main); color: var(--text-main); cursor: pointer"
                   @click="applySuggestion('Generate a reading passage about solar system with 3 gap fill items')"
                >
                  📖 Reading Passage
                </button>
                <button
                   type="button"
                   style="font-size: 0.62rem; padding: 0.15rem 0.35rem; border-radius: 4px; border: 1px solid var(--border-color); background: var(--bg-main); color: var(--text-main); cursor: pointer"
                   @click="applySuggestion('Create a crossword puzzle with terms related to European Geography')"
                >
                  🧩 Crossword
                </button>
                <button
                   type="button"
                   style="font-size: 0.62rem; padding: 0.15rem 0.35rem; border-radius: 4px; border: 1px solid var(--border-color); background: var(--bg-main); color: var(--text-main); cursor: pointer"
                   @click="applySuggestion('Create a True or False question table with statements about photosynthesis')"
                >
                  📊 True/False Table
                </button>
              </div>

              <div class="form-group" style="margin-bottom: 0.5rem">
                <textarea
                  v-model="aiPrompt"
                  rows="3"
                  placeholder="Describe what the worksheet should contain..."
                  style="font-size:0.75rem"
                  @input="autoExpand($event)"
                ></textarea>
              </div>

              <button
                class="btn-primary"
                :disabled="aiLoading"
                @click="sidebarGenerate()"
                style="width:100%;font-size:0.75rem;padding:0.4rem;display:flex;align-items:center;justify-content:center;gap:0.35rem"
              >
                <span>{{ aiLoading ? '🪄 Generating...' : '🪄 Generate Worksheet' }}</span>
              </button>
            </div>

            <!-- Tab 2: Differentiate Concept -->
            <div v-show="aiTab === 'differentiate'">
              <p style="font-size: 0.72rem; color: var(--text-muted); margin-bottom: 0.5rem">
                Provide a core concept, and the AI will generate three explanation levels (Basic, Standard, Advanced) as a study reference.
              </p>

              <div class="form-group" style="margin-bottom: 0.5rem">
                <label style="font-size: 0.65rem">AI Provider</label>
                <select v-model="aiProvider" style="font-size: 0.7rem; padding: 0.25rem">
                  <option value="gemini">Google Gemini 2.0 Flash</option>
                  <option value="opencode">OpenCode AI Client</option>
                </select>
              </div>

              <div v-if="differentiateTemplates.length" style="margin-bottom:0.4rem">
                <select style="font-size:0.68rem;padding:0.2rem;width:100%" @change="e => { if (e.target.value) { conceptInput = e.target.value; e.target.value = '' } }">
                  <option value="">🔀 Select concept template…</option>
                  <option v-for="t in differentiateTemplates" :key="t" :value="t">{{ t }}</option>
                </select>
              </div>

              <div style="display:flex;gap:0.35rem;margin-bottom:0.5rem">
                <input
                  v-model="conceptInput"
                  placeholder="Enter concept (e.g. Photosynthesis)..."
                  style="font-size:0.75rem;flex:1"
                />
                <button class="btn-primary" style="padding:0.25rem 0.5rem;font-size:0.72rem" :disabled="differentiateLoading" @click="differentiateConcept()">
                  {{ differentiateLoading ? '...' : 'Create Levels' }}
                </button>
              </div>

              <div v-if="differentiatedConcept" class="card" style="padding:0.5rem;margin-top:0.5rem;font-size:0.72rem;border: 1px solid var(--border-color)">
                <div style="margin-bottom:0.4rem">
                  <strong style="color:var(--text-muted)">🟢 Basic Level</strong>
                  <p style="margin:0.15rem 0 0;white-space:pre-wrap;line-height:1.4">{{ differentiatedConcept.basic }}</p>
                </div>
                <div style="margin-bottom:0.4rem">
                  <strong style="color:var(--primary)">🔵 Standard Level</strong>
                  <p style="margin:0.15rem 0 0;white-space:pre-wrap;line-height:1.4">{{ differentiatedConcept.standard }}</p>
                </div>
                <div style="margin-bottom:0.4rem">
                  <strong style="color:var(--warning)">🔴 Advanced Level</strong>
                  <p style="margin:0.15rem 0 0;white-space:pre-wrap;line-height:1.4">{{ differentiatedConcept.advanced }}</p>
                </div>
                <button class="btn-sm" style="width:100%;margin-top:0.25rem" @click="insertDifferentiatedInfoBox()">+ Add as Info Box Block</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Block Toolbar -->
        <div class="sidebar-section">
          <h3 class="sidebar-heading">Questions</h3>
          <div class="block-grid">
            <button class="block-btn" @click="addBlock('text')"><span class="block-btn-icon">📄</span> Text</button>
            <button class="block-btn" @click="addBlock('info_box')"><span class="block-btn-icon">💡</span> Info Box</button>
            <button class="block-btn" @click="addBlock('gap_fill')"><span class="block-btn-icon">✏️</span> Gap Fill</button>
            <button class="block-btn" @click="addBlock('multiple_choice')"><span class="block-btn-icon">✅</span> Multi Choice</button>
            <button class="block-btn" @click="addBlock('single_choice')"><span class="block-btn-icon">☑️</span> Single Choice</button>
            <button class="block-btn" @click="addBlock('short_answer')"><span class="block-btn-icon">📝</span> Short Answer</button>
            <button class="block-btn" @click="addBlock('true_false')"><span class="block-btn-icon">⚖️</span> True/False</button>
            <button class="block-btn" @click="addBlock('ordering')"><span class="block-btn-icon">🔢</span> Ordering</button>
            <button class="block-btn" @click="addBlock('word_scramble')"><span class="block-btn-icon">🔤</span> Scramble</button>
            <button class="block-btn" @click="addBlock('read_aloud')"><span class="block-btn-icon">🔊</span> Read Aloud</button>
            <button class="block-btn" @click="addBlock('question_table')"><span class="block-btn-icon">📊</span> Tabelle</button>
            <button class="block-btn" @click="addBlock('sentence_builder')"><span class="block-btn-icon">🧱</span> Satzbau</button>
            <button class="block-btn" @click="addBlock('odd_one_out')"><span class="block-btn-icon">🦄</span> Odd One</button>
          </div>
        </div>

        <div class="sidebar-section">
          <h3 class="sidebar-heading">🗣️ Language</h3>
          <div class="block-grid">
            <button class="block-btn" @click="addBlock('vocabulary')"><span class="block-btn-icon">📚</span> Vocab</button>
            <button class="block-btn" @click="addBlock('semantic_sorter')"><span class="block-btn-icon">🗂️</span> Sorter</button>
            <button class="block-btn" @click="addBlock('flashcards')"><span class="block-btn-icon">🃏</span> Cards</button>
            <button class="block-btn" @click="addBlock('drag_words')"><span class="block-btn-icon">👉</span> Drag Words</button>
            <button class="block-btn" @click="addBlock('correct_words')"><span class="block-btn-icon">✏️</span> Correct Words</button>
            <button class="block-btn" @click="addBlock('crossword')"><span class="block-btn-icon">🧩</span> Crossword</button>
            <button class="block-btn" @click="addBlock('audio_match')"><span class="block-btn-icon">🎧</span> Audio Match</button>
            <button class="block-btn" @click="addBlock('dictation')"><span class="block-btn-icon">🎤</span> Diktat</button>
            <button class="block-btn" @click="addBlock('word_search')"><span class="block-btn-icon">🔍</span> Search</button>
          </div>
        </div>

        <div class="sidebar-section">
          <h3 class="sidebar-heading">Media</h3>
          <div class="block-grid">
            <button class="block-btn" @click="addBlock('media')"><span class="block-btn-icon">🖼️</span> Image</button>
            <button class="block-btn" @click="addBlock('audio')"><span class="block-btn-icon">🎵</span> Audio</button>
            <button class="block-btn" @click="addBlock('video')"><span class="block-btn-icon">🎬</span> Video</button>
            <button class="block-btn" @click="addBlock('youtube')"><span class="block-btn-icon">📺</span> YouTube</button>
            <button class="block-btn" @click="addBlock('drawing')"><span class="block-btn-icon">🎨</span> Drawing</button>
          </div>
        </div>

        <!-- Version History (collapsible) -->
        <div v-if="isEditing && versionHistory.length" class="sidebar-section">
          <button class="collapse-toggle" @click="versionPanelOpen = !versionPanelOpen">
            <span class="collapse-toggle-label">📋 Version History</span>
            <span class="collapse-arrow" :class="{ open: versionPanelOpen }">▾</span>
          </button>
          <div v-show="versionPanelOpen" class="collapse-content">
            <div style="display:flex;justify-content:flex-end;margin-bottom:0.35rem">
              <button class="btn-sm" :disabled="versionLoading" @click="loadVersions()">
                {{ versionLoading ? 'Refreshing...' : 'Refresh' }}
              </button>
            </div>
            <div style="display:flex;flex-direction:column;gap:0.35rem">
              <div
                v-for="version in versionHistory"
                :key="version.id"
                style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.35rem;padding:0.4rem;border:1px solid var(--border-color);border-radius:6px"
              >
                <div style="font-size:0.72rem;line-height:1.3">
                  <div style="font-weight:600">v{{ version.version_number }}</div>
                  <div style="color:var(--text-muted);font-size:0.65rem">{{ version.change_summary || 'Saved' }}</div>
                  <div style="color:var(--text-muted);font-size:0.6rem">{{ formatVersionDate(version.created_at) }}</div>
                </div>
                <button class="btn-sm" style="font-size:0.6rem;flex-shrink:0" @click="restoreVersion(version.id)">Restore</button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- ===== Right Main Area (flex, scrollable) ===== -->
      <main class="builder-main">
        <!-- Sticky Editor Toolbar -->
        <div style="position: sticky; top: 0; z-index: 100; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.75rem 1rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; box-shadow: var(--shadow-sm); margin-bottom: 0.25rem">
          <div style="display: flex; align-items: center; gap: 0.5rem; min-width: 0; flex: 1">
            <span style="font-size: 1.25rem">📄</span>
            <span style="font-weight: 700; font-size: 1rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text-main)">
              {{ form.title || 'Untitled Worksheet' }}
            </span>
            <span v-if="form.subject || form.grade_level" style="font-size: 0.75rem; color: var(--text-muted); background: var(--bg-main); padding: 0.15rem 0.4rem; border-radius: 4px; border: 1px solid var(--border-color); white-space: nowrap">
              {{ form.subject }} · Klasse {{ form.grade_level }}
            </span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0">
            <div style="font-size: 0.75rem; font-weight: 600; color: var(--primary); background: var(--primary-light); border: 1px solid var(--primary-soft); border-radius: var(--radius-sm); padding: 0.25rem 0.5rem; white-space: nowrap">
              ⏱️ Est. Time: {{ estimatedTimeFormatted }}
            </div>
            <button class="btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; display: flex; align-items: center; gap: 0.25rem" @click="goToPreview">
              <span>👁️</span> <strong>Preview</strong>
            </button>
            <button class="btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; display: flex; align-items: center; gap: 0.25rem" @click="save">
              <span>💾</span> <strong>Save</strong>
            </button>
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="blocks.length === 0" class="card empty-state" style="text-align:center;color:var(--text-muted);padding:3rem">
          <div style="font-size:3rem;margin-bottom:0.5rem;opacity:0.3">📝</div>
          <p>Add exercise blocks from the sidebar to start building your worksheet</p>
        </div>

        <!-- Block cards -->
        <div
          v-for="(block, idx) in blocks"
          :key="block.id"
          class="card block-card"
          :class="{ 'is-collapsed': expandedBlockId !== block.id }"
          @click="expandBlock(block.id)"
          @focusout="updateBlockPoints(block)"
        >
          <!-- Block header row -->
          <div class="block-card-header" style="cursor: pointer" @click.stop="toggleBlockCollapse(block.id)">
            <div class="block-card-title" style="flex: 1; min-width: 0; display: flex; align-items: center; gap: 0.5rem">
              <span class="block-type-icon">{{ blockIcons[block.type] || '📄' }}</span>
              <strong style="white-space: nowrap">{{ germanBlockLabel[block.type] || block.type.replace(/_/g, ' ') }}</strong>
              <span v-if="expandedBlockId !== block.id" style="font-size: 0.75rem; color: var(--text-muted); font-style: italic; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-left: 0.5rem; flex: 1">
                {{ getBlockSnippet(block) }}
              </span>
            </div>
            <div class="block-card-controls" @click.stop>
              <label class="pts-label">Pts:</label>
              <input v-model.number="block.points" type="number" class="pts-input" min="0" />
              <button class="btn-sm" :disabled="idx === 0" @click="moveBlock(idx, -1)" title="Move up">↑</button>
              <button class="btn-sm" :disabled="idx === blocks.length - 1" @click="moveBlock(idx, 1)" title="Move down">↓</button>
              <button class="btn-sm btn-danger" @click="removeBlock(idx)" title="Delete block">×</button>
            </div>
          </div>

          <!-- Block fields -->
          <div v-show="expandedBlockId === block.id" class="block-card-body">
            <!-- Textarea for question-based blocks (exclude text, read_aloud, info_box which have their own) -->
            <div v-if="block.type !== 'text' && block.type !== 'read_aloud' && block.type !== 'info_box' && block.type !== 'true_false'" class="form-group">
              <textarea
                v-model="block.text"
                rows="2"
                :placeholder="'Write your question for this ' + block.type.replace(/_/g, ' ') + '...'"
                @input="autoExpand($event)"
              ></textarea>
            </div>

            <!-- Gap Fill -->
            <template v-if="block.type === 'gap_fill'">
              <p style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.4rem">
                💡 <strong>Gap Fill:</strong> Write your text below. Put words that should be blank gaps for students inside double parentheses. Example: <code>The capital of France is ((Paris)).</code>
              </p>
              <div class="form-group">
                <label>Template text with ((answers))</label>
                <textarea
                  v-model="block.template"
                  rows="3"
                  placeholder="E.g. Berlin is the capital of ((Germany))."
                  @input="autoExpand($event)"
                ></textarea>
              </div>
            </template>

            <!-- Multiple Choice / Single Choice -->
            <template v-if="block.type === 'multiple_choice' || block.type === 'single_choice'">
              <p style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.4rem">
                💡 <strong>{{ block.type === 'multiple_choice' ? 'Multiple Choice' : 'Single Choice' }}:</strong> Enter possible answers. Mark the correct answer(s) by checking the box/circle next to them.
              </p>
              <div
                v-for="(opt, oi) in block.options || []"
                :key="oi"
                style="display:flex;gap:0.5rem;align-items:center;margin-bottom:0.25rem"
              >
                <input
                  v-if="block.type === 'multiple_choice'"
                  v-model="block.correct"
                  type="checkbox"
                  :value="oi"
                  style="width:auto;flex-shrink:0"
                  @change="updateBlockPoints(block)"
                />
                <input
                  v-else
                  v-model="block.correct"
                  type="radio"
                  :value="oi"
                  name="correct"
                  style="width:auto;flex-shrink:0"
                  @change="updateBlockPoints(block)"
                />
                <input
                  v-model="block.options[oi]"
                  :placeholder="`Option ${oi + 1}`"
                  style="flex:1"
                  @input="updateBlockPoints(block)"
                />
                <button class="btn-sm btn-danger" @click="block.options.splice(oi, 1); updateBlockPoints(block)">×</button>
              </div>
              <button class="btn-sm" @click="block.options = [...(block.options || []), '']; updateBlockPoints(block)">+ Option</button>
            </template>

            <!-- True / False -->
            <template v-if="block.type === 'true_false'">
              <p style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.4rem">
                💡 <strong>True / False:</strong> Enter a statement, and select whether it is true or false.
              </p>
              <div class="form-group">
                <label>Statement</label>
                <textarea v-model="block.text" rows="2" placeholder="Enter the statement to evaluate..." @input="autoExpand($event)"></textarea>
              </div>
              <div style="display:flex;gap:1.5rem;margin-top:0.35rem">
                <label style="display:flex;align-items:center;gap:0.4rem;font-size:0.85rem;cursor:pointer">
                  <input type="radio" v-model="block.correct_answer" :value="true" style="width:auto" /> True
                </label>
                <label style="display:flex;align-items:center;gap:0.4rem;font-size:0.85rem;cursor:pointer">
                  <input type="radio" v-model="block.correct_answer" :value="false" style="width:auto" /> False
                </label>
              </div>
            </template>

            <!-- Matching -->
            <template v-if="block.type === 'matching'">
              <p style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.4rem">
                💡 <strong>Matching:</strong> Add matching items (Left and Right). They will be automatically shuffled for the student.
              </p>
              <div
                v-for="(pair, pi) in block.pairs || []"
                :key="pi"
                style="display:flex;gap:0.5rem;margin-bottom:0.25rem"
              >
                <input v-model="pair[0]" placeholder="Left Item (e.g. Dog)" style="flex:1" @input="updateBlockPoints(block)" />
                <span style="color:var(--text-muted)">→</span>
                <input v-model="pair[1]" placeholder="Right Item (e.g. Hund)" style="flex:1" @input="updateBlockPoints(block)" />
                <button class="btn-sm btn-danger" @click="block.pairs.splice(pi, 1); updateBlockPoints(block)">×</button>
              </div>
              <button class="btn-sm" @click="block.pairs = [...(block.pairs || []), ['', '']]; updateBlockPoints(block)">+ Pair</button>
            </template>

            <!-- Ordering -->
            <template v-if="block.type === 'ordering'">
              <p style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.4rem">
                💡 <strong>Ordering:</strong> Write the items in the **correct order** from top to bottom. The system will shuffle them for the student.
              </p>
              <div class="form-group">
                <label>Instruction</label>
                <textarea v-model="block.text" rows="1" placeholder="Put these items in the correct order..." @input="autoExpand($event)"></textarea>
              </div>
              <div
                v-for="(item, oi) in block.items || []"
                :key="oi"
                style="display:flex;gap:0.5rem;align-items:center;margin-bottom:0.25rem"
              >
                <span style="font-size:0.8rem;color:var(--text-muted);min-width:1.5rem;text-align:right;font-weight:600">{{ oi + 1 }}.</span>
                <input v-model="block.items[oi]" :placeholder="`Item ${oi + 1}`" style="flex:1" @input="updateBlockPoints(block)" />
                <button class="btn-sm btn-danger" @click="block.items.splice(oi, 1); updateBlockPoints(block)">×</button>
              </div>
              <button class="btn-sm" @click="block.items = [...(block.items || []), '']; updateBlockPoints(block)">+ Add Item</button>
            </template>

            <!-- Short Answer -->
            <template v-if="block.type === 'short_answer'">
              <p style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.4rem">
                💡 <strong>Short Answer:</strong> Enter key words or phrases (comma-separated) that must appear in the student's answer for it to be scored correct automatically.
              </p>
              <div class="form-group">
                <label>Keywords (comma-separated)</label>
                <input v-model="block.keywordsStr" placeholder="e.g. oxygen, photosynthesis" @input="updateBlockPoints(block)" />
              </div>
            </template>

            <!-- Text / Read Aloud -->
            <template v-if="block.type === 'text' || block.type === 'read_aloud'">
              <div class="form-group">
                <label>Content</label>
                <textarea v-model="block.text" rows="3" placeholder="Enter text content..." @input="autoExpand($event)"></textarea>
              </div>
            </template>

            <!-- Info Box -->
            <template v-if="block.type === 'info_box'">
              <div class="form-group">
                <label>Headline</label>
                <input v-model="block.title" placeholder="Clickable headline (e.g. 'Did you know?')" style="font-weight:600" />
              </div>
              <div class="form-group">
                <label>Content</label>
                <textarea v-model="block.text" rows="3" placeholder="Info content shown when clicked..." @input="autoExpand($event)"></textarea>
              </div>
              <div class="form-group">
                <label>Mermaid Diagram (optional)</label>
                <input v-model="block.mermaid" placeholder="Mermaid.js diagram code" style="font-size:0.7rem" />
              </div>
              <div class="form-group" style="margin-bottom:0">
                <label>Alt Text (optional)</label>
                <input v-model="block.alt_text" placeholder="Alt text for diagram" style="font-size:0.7rem" />
              </div>
            </template>

            <!-- Word Scramble -->
            <template v-if="block.type === 'word_scramble'">
              <label style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.35rem;font-size:0.8rem">
                <input type="checkbox" v-model="block.sentence_mode" /> Sentence mode (scramble word order)
              </label>
              <div
                v-for="(w, wi) in block.words || []"
                :key="wi"
                style="display:flex;gap:0.25rem;margin-bottom:0.25rem"
              >
                <input v-model="block.words[wi].word" :placeholder="block.sentence_mode ? 'Sentence' : 'Word'" style="flex:1" />
                <button class="btn-sm btn-danger" @click="block.words.splice(wi, 1)">×</button>
              </div>
              <button class="btn-sm btn-secondary" style="margin-top:0.35rem;margin-bottom:0.75rem;display:block" @click="block.words.push({ word: '' })">+ Add Scramble Item</button>
            </template>

            <!-- Drag Words -->
            <template v-if="block.type === 'drag_words'">
              <p style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.4rem">
                💡 <strong>Drag Words:</strong> Enter text. Put words to be dragged in double parentheses, e.g. <code>Learning ((flow)) is ((fun)).</code>
              </p>
              <div class="form-group">
                <label>Template text</label>
                <textarea
                  v-model="block.template"
                  rows="3"
                  placeholder="E.g. Learning ((flow)) is ((fun))."
                  @input="updateBlockPoints(block); autoExpand($event)"
                ></textarea>
              </div>
            </template>

            <!-- Correct Words -->
            <template v-if="block.type === 'correct_words'">
              <p style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.4rem">
                💡 <strong>Correct Words:</strong> Put wrong and correct words inside double parentheses separated by a slash, e.g. <code>He ((go/goes)) to school and ((play/plays)) soccer.</code> The wrong word will be displayed to the student, and they must type the correct word.
              </p>
              <div class="form-group">
                <label>Template text with ((wrong/correct))</label>
                <textarea
                  v-model="block.template"
                  rows="3"
                  placeholder="E.g. She ((go/goes)) home."
                  @input="updateBlockPoints(block); autoExpand($event)"
                ></textarea>
              </div>
            </template>

            <!-- Question Table -->
            <template v-if="block.type === 'question_table'">
              <p style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.4rem">
                💡 <strong>Question Table:</strong> Define the columns (possible answer choices) one per line. Enter rows (statements/questions) with their correct column answer appended after two pound signs <code>##</code>, e.g. <code>The sun is a star##True</code>.
              </p>
              <div class="form-group">
                <label>Columns (one per line, e.g., True / False)</label>
                <textarea
                  v-model="block.columnsStr"
                  rows="2"
                  placeholder="True&#10;False"
                  @input="block.columns = ($event.target.value || '').split('\n').map(s => s.trim()).filter(Boolean); updateBlockPoints(block)"
                ></textarea>
              </div>
              <div class="form-group">
                <label>Rows (Question##CorrectAnswer, one per line)</label>
                <textarea
                  v-model="block.rowsStr"
                  rows="4"
                  placeholder="The sun is a star##True&#10;The moon is cheese##False"
                  @input="block.rows = ($event.target.value || '').split('\n').map(s => s.trim()).filter(Boolean); updateBlockPoints(block)"
                ></textarea>
              </div>
            </template>

            <!-- Crossword -->
            <template v-if="block.type === 'crossword'">
              <p style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.4rem">
                💡 <strong>Crossword:</strong> Enter words and their descriptions/clues.
              </p>
              <div v-for="(item, idx) in block.words || []" :key="idx" style="display:flex;gap:0.5rem;margin-bottom:0.25rem">
                <input v-model="item.word" placeholder="Word (e.g. HELLO)" style="flex: 1;text-transform:uppercase;font-family:monospace" @input="updateBlockPoints(block)" />
                <input v-model="item.description" placeholder="Description/Clue (e.g. A greeting)" style="flex: 2" @input="updateBlockPoints(block)" />
                <button class="btn-sm btn-danger" @click="block.words.splice(idx, 1); updateBlockPoints(block)">×</button>
              </div>
              <button class="btn-sm" @click="block.words = [...(block.words || []), { word: '', description: '' }]; updateBlockPoints(block)">+ Add Clue/Word</button>
              <!-- Live grid preview -->
              <div v-if="(block.words || []).length > 0" style="margin-top:0.5rem;padding:0.5rem;background:var(--bg-main);border-radius:6px">
                <span style="font-size:0.7rem;color:var(--text-muted);display:block;margin-bottom:0.35rem">Grid Preview:</span>
                <div style="display:flex;gap:0.3rem;flex-wrap:wrap">
                  <div v-for="(item, idx) in block.words.filter(w => w.word.trim())" :key="'g-'+idx" style="text-align:center">
                    <div style="display:flex;gap:1px;margin-bottom:0.15rem">
                      <div v-for="ch in item.word.toUpperCase()" :key="ch" style="width:22px;height:22px;border:1px solid #ccc;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;font-family:monospace;background:#fff;border-radius:2px">{{ ch }}</div>
                    </div>
                    <span style="font-size:0.62rem;color:var(--text-muted)">#{{ Number(idx) + 1 }}</span>
                  </div>
                </div>
              </div>
            </template>

            <!-- Media / Audio / Video -->
            <template v-if="block.type === 'media' || block.type === 'audio' || block.type === 'video'">
              <div style="display:flex;gap:0.5rem;align-items:center">
                <input
                  v-model="block.src"
                  :placeholder="block.type === 'media' ? 'Image URL' : block.type === 'audio' ? 'Audio URL (.mp3)' : 'Video URL (.mp4)'"
                  style="flex:1"
                />
                <label class="btn-sm" style="cursor:pointer;margin:0;white-space:nowrap">
                  Upload
                  <input type="file" :accept="block.type === 'media' ? 'image/*' : block.type === 'audio' ? 'audio/*' : 'video/*'" style="display:none" @change="uploadFile($event, block)" />
                </label>
              </div>
              <div class="form-group" style="margin-top:0.35rem">
                <label>Caption (optional)</label>
                <input v-model="block.caption" placeholder="Caption" />
              </div>
              <div v-if="block.src" style="margin-top:0.5rem">
                <img v-if="block.type === 'media'" :src="block.src" style="max-width:100%;max-height:200px;border-radius:4px" />
                <audio v-else-if="block.type === 'audio'" :src="block.src" controls style="width:100%"></audio>
                <video v-else :src="block.src" controls style="max-width:100%;max-height:200px;border-radius:4px"></video>
              </div>
            </template>

            <!-- YouTube -->
            <template v-if="block.type === 'youtube'">
              <div class="form-group">
                <label>YouTube URL</label>
                <input v-model="block.src" placeholder="YouTube URL (e.g. https://youtube.com/watch?v=...)" />
              </div>
              <div v-if="block.src && isYoutube(block.src)" style="margin-top:0.5rem;position:relative;padding-bottom:56.25%;height:0">
                <iframe :src="youtubeEmbed(block.src)" style="position:absolute;top:0;left:0;width:100%;height:100%;border-radius:4px" frameborder="0" allowfullscreen></iframe>
              </div>
            </template>

            <!-- Drawing -->
            <template v-if="block.type === 'drawing'">
              <div class="form-group">
                <label>Drawing Prompt / Instructions</label>
                <textarea v-model="block.text" rows="2" placeholder="Describe what to draw..." @input="autoExpand($event)"></textarea>
              </div>
              <div style="display:flex;gap:0.5rem">
                <div class="form-group" style="flex:1">
                  <label>Canvas Width</label>
                  <input v-model.number="block.canvas_width" type="number" min="100" />
                </div>
                <div class="form-group" style="flex:1">
                  <label>Canvas Height</label>
                  <input v-model.number="block.canvas_height" type="number" min="100" />
                </div>
              </div>
              <div class="form-group" style="margin-bottom:0">
                <label>Background Image URL (optional)</label>
                <input v-model="block.background_image" placeholder="https://..." />
              </div>
            </template>

            <!-- Vocabulary -->
            <template v-if="block.type === 'vocabulary'">
              <div class="form-group">
                <label>Translation Direction</label>
                <select v-model="block.vocabulary.direction" @change="updateBlockPoints(block)">
                  <option value="l2r">Left to Right (Source → Target)</option>
                  <option value="r2l">Right to Left (Target → Source)</option>
                </select>
              </div>
              <label style="display:block;font-size:0.75rem;font-weight:600;margin-bottom:0.25rem">Vocabulary Pairs</label>
              <div
                v-for="(pair, pi) in block.vocabulary.pairs || []"
                :key="pi"
                style="display:flex;gap:0.5rem;margin-bottom:0.25rem"
              >
                <input v-model="pair.l" placeholder="Source Language" style="flex:1" />
                <span style="color:var(--text-muted)">→</span>
                <input v-model="pair.r" placeholder="Target Language (Translation)" style="flex:1" />
                <button class="btn-sm btn-danger" @click="block.vocabulary.pairs.splice(pi, 1); updateBlockPoints(block)">×</button>
              </div>
              <button class="btn-sm" @click="block.vocabulary.pairs = [...(block.vocabulary.pairs || []), { l: '', r: '' }]; updateBlockPoints(block)">+ Add Word Pair</button>
            </template>

            <!-- Audio Match -->
            <template v-if="block.type === 'audio_match'">
              <p style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.4rem">
                💡 <strong>Audio Match:</strong> Enter text to be spoken (Left) and its matching text (Right). Choose a voice and generate audios.
              </p>
              <div class="form-group">
                <label>Voice Accent / Gender</label>
                <select v-model="block.voice" style="font-size: 0.8rem">
                  <option value="en-US-JennyNeural">English (US) - Female (Jenny)</option>
                  <option value="en-US-GuyNeural">English (US) - Male (Guy)</option>
                  <option value="de-DE-KatjaNeural">German - Female (Katja)</option>
                  <option value="de-DE-ConradNeural">German - Male (Conrad)</option>
                </select>
              </div>
              <div v-for="(pair, pi) in block.pairs || []" :key="pi" style="display:flex;gap:0.5rem;margin-bottom:0.25rem;align-items:center">
                <input v-model="pair[0]" placeholder="Spoken Text (Left)" style="flex:1" @input="updateBlockPoints(block)" />
                <span style="color:var(--text-muted)">→</span>
                <input v-model="pair[1]" placeholder="Matching Text (Right)" style="flex:1" @input="updateBlockPoints(block)" />
                <button class="btn-sm btn-danger" @click="block.pairs.splice(pi, 1); if(block.audioUrls) block.audioUrls.splice(pi, 1); updateBlockPoints(block)">×</button>
              </div>
              <div style="display:flex;gap:0.5rem;margin-top:0.4rem">
                <button class="btn-sm" @click="block.pairs = [...(block.pairs || []), ['', '']]; updateBlockPoints(block)">+ Add Pair</button>
                <button class="btn-sm btn-primary" :disabled="block.audioLoading" @click="generateAudioMatchAudios(block)">
                  {{ block.audioLoading ? 'Generating...' : '🔊 Generate All Audios' }}
                </button>
              </div>
              <div v-if="block.audioUrls && block.audioUrls.length" style="margin-top:0.5rem;font-size:0.75rem;color:var(--text-muted)">
                Generated audios: {{ block.audioUrls.filter(Boolean).length }} / {{ block.pairs.length }}
              </div>
            </template>

            <!-- Dictation -->
            <template v-if="block.type === 'dictation'">
              <p style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.4rem">
                💡 <strong>Dictation:</strong> Enter the text that the student should type. Select a voice and click "Generate Audio".
              </p>
              <div class="form-group">
                <label>Text to be spoken</label>
                <textarea
                  v-model="block.audioText"
                  rows="2"
                  placeholder="Welcome to learnflow."
                  @input="updateBlockPoints(block)"
                ></textarea>
              </div>
              <div style="display:flex;gap:0.5rem;align-items:flex-end">
                <div class="form-group" style="flex:1;margin-bottom:0">
                  <label>Voice Accent / Gender</label>
                  <select v-model="block.voice" style="font-size: 0.8rem">
                    <option value="en-US-JennyNeural">English (US) - Female (Jenny)</option>
                    <option value="en-US-GuyNeural">English (US) - Male (Guy)</option>
                    <option value="de-DE-KatjaNeural">German - Female (Katja)</option>
                    <option value="de-DE-ConradNeural">German - Male (Conrad)</option>
                  </select>
                </div>
                <button class="btn-sm btn-primary" style="height:38px" :disabled="block.audioLoading" @click="generateBlockAudio(block, block.audioText, 'audioUrl')">
                  {{ block.audioLoading ? 'Generating...' : '🔊 Generate Audio' }}
                </button>
              </div>
              <div v-if="block.audioUrl" style="margin-top:0.75rem">
                <audio controls :src="block.audioUrl" style="width:100%"></audio>
              </div>
            </template>

            <!-- Semantic Sorter -->
            <template v-if="block.type === 'semantic_sorter'">
              <label style="display:block;font-size:0.75rem;font-weight:600;margin-bottom:0.25rem">Categories & Items</label>
              <div
                v-for="(cat, ci) in block.categories || []"
                :key="ci"
                style="padding:0.5rem;border:1px solid var(--border-color);border-radius:4px;margin-bottom:0.5rem;background:var(--bg-main)"
              >
                <div style="display:flex;gap:0.5rem;align-items:center;margin-bottom:0.35rem">
                  <input v-model="cat.name" placeholder="Category Label (e.g. 'Nouns')" style="font-weight:600;flex:1" />
                  <button class="btn-sm btn-danger" @click="block.categories.splice(ci, 1); updateBlockPoints(block)">Delete Category</button>
                </div>
                <div style="margin-left:1rem">
                  <label style="font-size:0.7rem;color:var(--text-muted);display:block;margin-bottom:0.2rem">Items in this Category:</label>
                  <div
                    v-for="(word, wi) in cat.words || []"
                    :key="wi"
                    style="display:flex;gap:0.25rem;margin-bottom:0.25rem"
                  >
                    <input v-model="cat.words[wi]" placeholder="Word / Phrase" style="font-size:0.75rem;padding:0.2rem;flex:1" />
                    <button class="btn-sm btn-danger" @click="cat.words.splice(wi, 1); updateBlockPoints(block)">×</button>
                  </div>
                  <button class="btn-sm" style="font-size:0.7rem;padding:0.15rem 0.4rem" @click="cat.words = [...(cat.words || []), '']; updateBlockPoints(block)">+ Add Item</button>
                </div>
              </div>
              <button class="btn-sm" @click="block.categories = [...(block.categories || []), { name: '', words: [] }]; updateBlockPoints(block)">+ Add Category</button>
            </template>

            <!-- Flashcards -->
            <template v-if="block.type === 'flashcards'">
              <label style="display:block;font-size:0.75rem;font-weight:600;margin-bottom:0.25rem">Flashcards</label>
              <div
                v-for="(card, ci) in block.cards || []"
                :key="ci"
                style="padding:0.5rem;border:1px solid var(--border-color);border-radius:4px;margin-bottom:0.5rem;background:var(--bg-main)"
              >
                <div style="display:flex;gap:0.5rem;margin-bottom:0.25rem">
                  <input v-model="card.front" placeholder="Front Side Text" style="flex:1" />
                  <input v-model="card.back" placeholder="Back Side Text" style="flex:1" />
                </div>
                <div style="display:flex;gap:0.5rem;margin-top:0.25rem">
                  <input v-model="card.image_url" placeholder="Image URL (optional)" style="font-size:0.75rem;flex:1" />
                  <input v-model="card.audio_url" placeholder="Audio URL (optional)" style="font-size:0.75rem;flex:1" />
                  <button class="btn-sm btn-danger" @click="block.cards.splice(ci, 1); updateBlockPoints(block)">×</button>
                </div>
              </div>
              <button class="btn-sm" @click="block.cards = [...(block.cards || []), { front: '', back: '', image_url: '', audio_url: '' }]; updateBlockPoints(block)">+ Add Card</button>
            </template>

            <!-- Word Search -->
            <template v-if="block.type === 'word_search'">
              <p style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.4rem">
                💡 <strong>Word Search:</strong> Enter the words that students must find, separated by commas.
              </p>
              <div class="form-group">
                <label>Words (comma-separated)</label>
                <input
                  v-model="block.wordsStr"
                  placeholder="e.g. APPLE, BANANA, ORANGE"
                  @input="block.words = ($event.target.value || '').split(',').map(s => s.trim().toUpperCase()).filter(Boolean); updateBlockPoints(block)"
                />
              </div>
            </template>

            <!-- Sentence Builder -->
            <template v-if="block.type === 'sentence_builder'">
              <p style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.4rem">
                💡 <strong>Sentence Builder:</strong> Enter the target sentence in the correct word order. The player shuffles the words for the student.
              </p>
              <div class="form-group">
                <label>Correct Sentence</label>
                <input
                  v-model="block.sentence"
                  placeholder="e.g. The quick brown fox jumps."
                  @input="updateBlockPoints(block)"
                />
              </div>
            </template>

            <!-- Odd One Out -->
            <template v-if="block.type === 'odd_one_out'">
              <p style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.4rem">
                💡 <strong>Odd One Out:</strong> Enter a list of items. Mark the correct item index as the odd one out, and provide the explanation.
              </p>
              <div v-for="(item, idx) in block.items || []" :key="idx" style="display:flex;gap:0.5rem;margin-bottom:0.25rem;align-items:center">
                <input type="radio" v-model="block.correct" :value="idx" name="odd_one_out_correct" />
                <input v-model="block.items[idx]" :placeholder="`Item ${idx + 1}`" style="flex:1" />
                <button class="btn-sm btn-danger" @click="block.items.splice(idx, 1); updateBlockPoints(block)">×</button>
              </div>
              <button class="btn-sm" style="margin-top:0.25rem;margin-bottom:0.5rem" @click="block.items = [...(block.items || []), '']; updateBlockPoints(block)">+ Add Item</button>
              <div class="form-group">
                <label>Explanation of why this item is the odd one</label>
                <textarea
                  v-model="block.reason"
                  rows="2"
                  placeholder="e.g. Carrot is a vegetable, while the others are fruits."
                  @input="updateBlockPoints(block)"
                ></textarea>
              </div>
            </template>

            <!-- Mermaid (common to all blocks) -->
            <details style="margin-top:0.75rem;font-size:0.8rem">
              <summary>+ Mermaid Diagram</summary>
              <textarea
                v-model="block.mermaid"
                rows="3"
                placeholder="graph TD; A[Concept] --> B[Outcome]"
                style="font-family:monospace;font-size:0.75rem;margin-top:0.25rem"
              ></textarea>
              <input v-model="block.alt_text" placeholder="Alt text" style="margin-top:0.25rem" />
            </details>
          </div>
        </div>
      </main>
    </div>

    <!-- Greeting Setup Dialog Overlay -->
    <div v-if="showSetupModal" class="modal-overlay">
      <div class="modal-container card">
        <div class="modal-header">
          <h3>👋 Worksheet Configuration</h3>
          <p>Please configure the details below to start editing the worksheet.</p>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Worksheet Title</label>
            <input v-model="form.title" placeholder="Enter title (e.g. Photosynthesis Intro)" />
          </div>
          <div style="display:flex;gap:0.75rem;margin-top:0.75rem">
            <div class="form-group" style="flex:1">
              <label>Subject</label>
              <select v-model="form.subject">
                <option value="">-- Select Subject --</option>
                <option v-for="s in subjects" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
            <div class="form-group" style="flex:1">
              <label>Class / Grade</label>
              <select v-model="form.grade_level">
                <option value="">-- Select Grade --</option>
                <option v-for="g in gradeLevels" :key="g" :value="g">Klasse {{ g }}</option>
              </select>
            </div>
          </div>
          <div class="form-group" style="margin-top:0.75rem">
            <label>Description (Optional)</label>
            <textarea v-model="form.description" rows="2" placeholder="Describe the focus or instructions..."></textarea>
          </div>
          <div class="form-group" style="margin-top:0.75rem">
            <label>Pupil Target Speed Profile (optional)</label>
            <select v-model="form.pupil_profile">
              <option value="default">Default Pupil (Average Speed)</option>
              <option value="slow">Slow Worker (+50% Time)</option>
              <option value="fast">Fast Worker (-30% Time)</option>
            </select>
          </div>
        </div>
        <div class="modal-footer" style="display:flex;justify-content:flex-end;margin-top:1.25rem">
          <button class="btn-primary" @click="submitSetup">Save & Start Editing</button>
        </div>
      </div>
    </div>

    <!-- AI Generator Preview Modal Overlay -->
    <div v-if="showAiPreviewModal" class="modal-overlay">
      <div class="modal-container card" style="max-width: 800px; max-height: 85vh; display: flex; flex-direction: column">
        <div class="modal-header">
          <h3>✨ AI Generated Worksheet Preview</h3>
          <p>Review the generated exercises before importing them into your worksheet.</p>
        </div>
        <div class="modal-body" style="flex: 1; overflow-y: auto; padding-right: 0.5rem; margin-top: 0.5rem">
          <div v-if="aiPreviewBlocks.length === 0" style="text-align: center; color: var(--text-muted); padding: 2rem">
            No blocks generated.
          </div>
          <div v-else style="display: flex; flex-direction: column; gap: 0.75rem">
            <div v-for="(block, idx) in aiPreviewBlocks" :key="block.id || idx" class="card" style="padding: 0.85rem; border: 1px solid var(--border-color)">
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.35rem">
                <strong>{{ block.type.replace(/_/g, ' ') }}</strong>
                <span class="badge">{{ block.points }} pts</span>
              </div>
              <div style="font-size: 0.85rem; color: var(--text-main)">
                <div v-if="block.text" style="white-space: pre-wrap; font-weight: 500">{{ block.text }}</div>
                <div v-if="block.template" style="font-family: monospace; background: var(--bg-main); padding: 0.35rem; border-radius: 4px; margin-top: 0.25rem">
                  {{ block.template }}
                </div>
                <div v-if="block.options?.length" style="margin-top: 0.35rem">
                  <div v-for="(opt, oi) in block.options" :key="oi" style="padding: 0.15rem 0">
                    <span v-if="block.correct === oi || (Array.isArray(block.correct) && block.correct.includes(oi))" style="color: var(--success)">[✓]</span>
                    <span v-else>[ ]</span>
                    {{ opt }}
                  </div>
                </div>
                <div v-if="block.pairs?.length" style="margin-top: 0.35rem; font-size: 0.8rem">
                  <div v-for="(pair, pi) in block.pairs" :key="pi">
                    {{ pair[0] }} ➔ {{ pair[1] }}
                  </div>
                </div>
                <div v-if="block.words?.length" style="margin-top: 0.35rem">
                  <strong>Words/Clues:</strong>
                  <div v-for="(item, wi) in block.words" :key="wi" style="font-size: 0.8rem">
                    {{ item.word }} <span v-if="item.description" style="color: var(--text-muted)">({{ item.description }})</span>
                  </div>
                </div>
                <div v-if="block.rows?.length" style="margin-top: 0.35rem">
                  <table style="width: 100%; border: 1px solid var(--border-color); font-size: 0.8rem">
                    <thead>
                      <tr>
                        <th>Statement</th>
                        <th v-for="col in block.columns" :key="col">{{ col }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="row in block.rows" :key="row">
                        <td>{{ row.split('##')[0] }}</td>
                        <td v-for="col in block.columns" :key="col" style="text-align: center">
                          <span v-if="row.split('##')[1] === col" style="color: var(--success)">✓</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div v-if="block.type === 'info_box' && block.mermaid" style="margin-top: 0.5rem; background: var(--bg-main); padding: 0.4rem; border-radius: 4px">
                  <code>Mermaid Diagram Code Present</code>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1.25rem; border-top: 1px solid var(--border-color); padding-top: 0.75rem">
          <button class="btn-sm" @click="discardAiGeneratedBlocks">Discard & Re-prompt</button>
          <button class="btn-primary btn-sm" @click="keepAiGeneratedBlocks">Keep & Add to Worksheet</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWorksheetsStore } from '../stores/worksheets'
import { useUiStore } from '../stores/ui'
import { api } from '../services/api'

const route = useRoute()
const router = useRouter()
const store = useWorksheetsStore()
const uiStore = useUiStore()

const emptyForm = () => ({ title: '', subject: '', grade_level: '', description: '', source_lang: '', target_lang: '', cefr_level: '', pupil_profile: 'default' })

const isEditing = ref(false)
const blocks = ref([])
const form = ref(emptyForm())
const subjects = ref([])
const gradeLevels = ref([])
const aiPrompt = ref('')
const aiLernziele = ref('')
const aiDifficulty = ref('medium')
const aiLength = ref('medium')
const aiProvider = ref('gemini')
const aiStyle = ref('practice')
const aiLoading = ref(false)
const conceptInput = ref('')
const differentiateLoading = ref(false)
const differentiatedConcept = ref(null)
const versionHistory = ref([])
const versionLoading = ref(false)
const aiPanelOpen = ref(false)
const aiTab = ref('generate')
const titlePanelOpen = ref(false)
const versionPanelOpen = ref(true)
const showSetupModal = ref(false)

const expandedBlockId = ref(null)

function expandBlock(id) {
  if (expandedBlockId.value !== id) {
    expandedBlockId.value = id
  }
}

function toggleBlockCollapse(id) {
  expandedBlockId.value = expandedBlockId.value === id ? null : id
}

function getBlockSnippet(block) {
  if (!block) return ''
  const val = block.text || block.template || block.sentence || block.audioText || block.title || ''
  if (val.length > 60) return val.substring(0, 60) + '...'
  return val || '(empty block)'
}

const estimatedTimeSeconds = computed(() => {
  let total = 0
  const profile = form.value.pupil_profile || 'default'
  let multiplier = 1.0
  if (profile === 'slow') multiplier = 1.5
  if (profile === 'fast') multiplier = 0.7

  const grade = parseInt(form.value.grade_level) || 5
  if (grade <= 3) multiplier *= 1.3
  else if (grade >= 7) multiplier *= 0.85

  for (const block of blocks.value) {
    if (!block.type) continue
    switch (block.type) {
      case 'text':
      case 'read_aloud': {
        const words = (block.text || '').split(/\s+/).filter(Boolean).length
        total += words * 1.2
        break
      }
      case 'info_box': {
        const words = (block.text || '').split(/\s+/).filter(Boolean).length
        total += words * 1.2 + 10
        break
      }
      case 'media':
        total += 10
        break
      case 'audio':
        total += 60
        break
      case 'video':
        total += 120
        break
      case 'youtube':
        total += 180
        break
      case 'gap_fill': {
        const gaps = (block.template || '').match(/\(\(.*?\)\)/g)?.length || 0
        total += gaps * 15 + 10
        break
      }
      case 'drag_words': {
        const gaps = (block.template || '').match(/\(\(.*?\)\)/g)?.length || 0
        total += gaps * 12 + 10
        break
      }
      case 'correct_words': {
        const gaps = (block.template || '').match(/\(\(.*?\)\)/g)?.length || 0
        total += gaps * 20 + 10
        break
      }
      case 'question_table': {
        const rows = (block.rows || []).length
        total += rows * 15
        break
      }
      case 'single_choice':
      case 'multiple_choice': {
        const opts = (block.options || []).length
        total += 20 + opts * 5
        break
      }
      case 'matching': {
        const pairs = (block.pairs || []).length
        total += pairs * 15
        break
      }
      case 'word_scramble': {
        const words = (block.words || []).length
        total += words * 30
        break
      }
      case 'short_answer':
        total += 90
        break
      case 'true_false':
        total += 15
        break
      case 'ordering': {
        const items = (block.items || []).length
        total += items * 15
        break
      }
      case 'vocabulary': {
        const pairs = (block.vocabulary?.pairs || []).length
        total += pairs * 15
        break
      }
      case 'semantic_sorter': {
        const count = (block.categories || []).reduce((s, c) => s + (c.words || []).length, 0)
        total += count * 10
        break
      }
      case 'flashcards': {
        const cards = (block.cards || []).length
        total += cards * 15
        break
      }
      case 'crossword': {
        const words = (block.words || []).length
        total += words * 45
        break
      }
      case 'audio_match': {
        const pairs = (block.pairs || []).length
        total += pairs * 20
        break
      }
      case 'dictation':
        total += 60
        break
      case 'word_search': {
        const words = (block.words || []).length
        total += words * 30
        break
      }
      case 'sentence_builder':
        total += 25
        break
      case 'odd_one_out':
        total += 30
        break
      case 'drawing':
        total += 120
        break
      default:
        total += 30
    }
  }
  return Math.max(15, Math.round(total * multiplier))
})

const estimatedTimeFormatted = computed(() => {
  const mins = Math.floor(estimatedTimeSeconds.value / 60)
  const secs = estimatedTimeSeconds.value % 60
  if (mins === 0) return `${secs}s`
  return `${mins}m ${secs}s`
})

function applySuggestion(text) {
  aiPrompt.value = text
}

const lernzieleTemplates = computed(() => {
  const s = form.value.subject
  const map = {
    'Mathematik': [
      'Die Schüler/innen können Brüche addieren und subtrahieren.',
      'Die Schüler/innen können Gleichungen mit einer Unbekannten lösen.',
      'Die Schüler/innen können Flächen und Umfänge berechnen.',
      'Die Schüler/innen können Prozentrechnung anwenden.',
      'Die Schüler/innen können Dezimalzahlen multiplizieren und dividieren.',
      'Die Schüler/innen können Dreisatz-Aufgaben lösen.',
      'Die Schüler/innen können Winkel messen und benennen.',
      'Die Schüler/innen können statistische Daten auswerten.',
      'Die Schüler/innen können Potenzen und Wurzeln berechnen.',
      'Die Schüler/innen können lineare Funktionen darstellen.',
    ],
    'Deutsch': [
      'Die Schüler/innen können einen Text sinnerfassend lesen.',
      'Die Schüler/innen können Satzglieder bestimmen.',
      'Die Schüler/innen können Rechtschreibregeln anwenden.',
      'Die Schüler/innen können einen Aufsatz strukturiert verfassen.',
      'Die Schüler/innen können Wortarten erkennen und benennen.',
      'Die Schüler/innen können direkte und indirekte Rede unterscheiden.',
      'Die Schüler/innen können Texte zusammenfassen.',
      'Die Schüler/innen können Groß- und Kleinschreibung korrekt anwenden.',
      'Die Schüler/innen können Kommaregeln anwenden.',
      'Die Schüler/innen können Metaphern und Stilmittel erkennen.',
    ],
    'Englisch': [
      'Students can use the simple past tense correctly.',
      'Students can describe people and places using adjectives.',
      'Students can understand and answer questions about a text.',
      'Students can use modal verbs (can, must, should).',
      'Students can write a short informal letter or email.',
      'Students can use the present perfect tense.',
      'Students can talk about future plans using will/going to.',
      'Students can use conditional sentences (if-clauses type 1).',
      'Students can expand their vocabulary on the topic of daily life.',
      'Students can use passive voice in simple sentences.',
    ],
    'Geschichte': [
      'Die Schüler/innen können wichtige Ereignisse der Weltgeschichte einordnen.',
      'Die Schüler/innen können historische Quellen analysieren.',
      'Die Schüler/innen können Ursachen und Folgen historischer Ereignisse erklären.',
      'Die Schüler/innen können die Entwicklung der Demokratie beschreiben.',
      'Die Schüler/innen können das Leben im Mittelalter beschreiben.',
      'Die Schüler/innen können die Ursachen des Ersten Weltkriegs nennen.',
      'Die Schüler/innen können den Nationalsozialismus kritisch reflektieren.',
      'Die Schüler/innen können die Bedeutung der Französischen Revolution erklären.',
    ],
    'Geographie': [
      'Die Schüler/innen können Klimazonen der Erde beschreiben.',
      'Die Schüler/innen können Karten lesen und interpretieren.',
      'Die Schüler/innen können Naturkatastrophen erklären.',
      'Die Schüler/innen können wirtschaftliche Unterschiede zwischen Ländern erklären.',
      'Die Schüler/innen können den Wasserkreislauf beschreiben.',
      'Die Schüler/innen können Bevölkerungsentwicklung analysieren.',
      'Die Schüler/innen können Gebirgsbildung und Plattentektonik erklären.',
    ],
    'Biologie': [
      'Die Schüler/innen können den Aufbau der Zelle beschreiben.',
      'Die Schüler/innen können Fotosynthese und Zellatmung erklären.',
      'Die Schüler/innen können Ökosysteme und Nahrungsketten beschreiben.',
      'Die Schüler/innen können die Vererbungslehre anwenden.',
      'Die Schüler/innen können den menschlichen Körper und seine Organe benennen.',
      'Die Schüler/innen können Evolution und natürliche Selektion erklären.',
      'Die Schüler/innen können Wirbeltiere und Wirbellose unterscheiden.',
    ],
    'Physik': [
      'Die Schüler/innen können das Ohmsche Gesetz anwenden.',
      'Die Schüler/innen können Kräfte und Bewegungen beschreiben.',
      'Die Schüler/innen können Energieformen und Energieumwandlung erklären.',
      'Die Schüler/innen können einfache Stromkreise zeichnen.',
      'Die Schüler/innen können Aggregatzustände und Wärmeübertragung erklären.',
      'Die Schüler/innen können Schall und Licht als Wellenphänomene beschreiben.',
      'Die Schüler/innen können Hebelgesetze anwenden.',
    ],
    'Chemie': [
      'Die Schüler/innen können das Periodensystem lesen.',
      'Die Schüler/innen können chemische Reaktionsgleichungen aufstellen.',
      'Die Schüler/innen können Säuren und Basen unterscheiden.',
      'Die Schüler/innen können Atombau und Elektronenkonfiguration beschreiben.',
      'Die Schüler/innen können organische Verbindungen benennen.',
      'Die Schüler/innen können Oxidation und Reduktion erklären.',
    ],
    'Informatik': [
      'Die Schüler/innen können einfache Algorithmen beschreiben.',
      'Die Schüler/innen können Variablen und Schleifen in einer Programmiersprache verwenden.',
      'Die Schüler/innen können Daten in Tabellen und Datenbanken organisieren.',
      'Die Schüler/innen können Datenschutz und Datensicherheit erklären.',
      'Die Schüler/innen können Binärzahlen umrechnen.',
    ],
    'Musik': [
      'Die Schüler/innen können Noten lesen und schreiben.',
      'Die Schüler/innen können Musikstile und Epochen unterscheiden.',
      'Die Schüler/innen können Rhythmus und Takt erkennen.',
      'Die Schüler/innen können Instrumente der Orchester benennen.',
    ],
    'Kunst': [
      'Die Schüler/innen können Farbenlehre und Farbmischung anwenden.',
      'Die Schüler/innen können Perspektive in Zeichnungen darstellen.',
      'Die Schüler/innen können Kunststile und Epochen beschreiben.',
      'Die Schüler/innen können eigene kreative Werke gestalten.',
    ],
    'Sport': [
      'Die Schüler/innen können Spielregeln erklären und anwenden.',
      'Die Schüler/innen können Aufwärm- und Dehnübungen durchführen.',
      'Die Schüler/innen können fair play und Teamarbeit demonstrieren.',
    ],
    'Ethik': [
      'Die Schüler/innen können ethische Dilemmata analysieren.',
      'Die Schüler/innen können verschiedene Wertvorstellungen vergleichen.',
      'Die Schüler/innen können Menschenrechte benennen und erklären.',
    ],
    'Religion': [
      'Die Schüler/innen können Weltreligionen vergleichen.',
      'Die Schüler/innen können religiöse Feste und Bräuche beschreiben.',
      'Die Schüler/innen können biblische Texte interpretieren.',
    ],
  }
  return map[s] || []
})

const blockIcons = {
  text: '📄',
  read_aloud: '🔊',
  gap_fill: '✏️',
  multiple_choice: '✅',
  single_choice: '☑️',
  short_answer: '📝',
  matching: '🔗',
  word_scramble: '🔤',
  media: '🖼️',
  audio: '🎵',
  video: '🎬',
  youtube: '📺',
  info_box: '💡',
  true_false: '⚖️',
  ordering: '🔢',
  drawing: '🎨',
  vocabulary: '📚',
  semantic_sorter: '🗂️',
  flashcards: '🃏',
  drag_words: '👉',
  correct_words: '✏️',
  question_table: '📊',
  crossword: '🧩',
  audio_match: '🎧',
  dictation: '🎤',
  word_search: '🔍',
  sentence_builder: '🧱',
  odd_one_out: '🦄',
}

const germanBlockLabel = {
  vocabulary: 'Wortschatz',
  semantic_sorter: 'Kategoriensortierung',
  flashcards: 'Karteikarten',
  drag_words: 'Wörter ziehen',
  correct_words: 'Fehler korrigieren',
  question_table: 'Fragentabelle',
  crossword: 'Kreuzworträtsel',
  audio_match: 'Hören & Zuordnen',
  dictation: 'Diktat',
  word_search: 'Suchrätsel',
  sentence_builder: 'Satzbaumeister',
  odd_one_out: 'Ungerades Wort',
}

const differentiateTemplates = computed(() => {
  const s = form.value.subject
  const map = {
    'Mathematik': [
      'Brüche', 'Gleichungen', 'Prozentrechnung', 'Flächenberechnung', 'Dreisatz',
      'Dezimalzahlen', 'Potenzen', 'Lineare Funktionen', 'Statistik', 'Geometrie',
    ],
    'Deutsch': [
      'Satzglieder', 'Wortarten', 'Rechtschreibung', 'Aufsatz schreiben',
      'Direkte Rede', 'Kommaregeln', 'Textanalyse', 'Stilmittel',
    ],
    'Englisch': [
      'Simple Past', 'Present Perfect', 'Modal verbs', 'Passive voice',
      'Conditional sentences', 'Reported speech', 'Adjectives and adverbs',
    ],
    'Geschichte': [
      'Erster Weltkrieg', 'Zweiter Weltkrieg', 'Nationalsozialismus',
      'Französische Revolution', 'Mittelalter', 'Antikes Rom', 'Demokratie',
    ],
    'Geographie': [
      'Klimazonen', 'Plattentektonik', 'Wasserkreislauf', 'Bevölkerungsentwicklung',
      'Wirtschaftsräume', 'Naturkatastrophen',
    ],
    'Biologie': [
      'Zellaufbau', 'Fotosynthese', 'Ökosystem', 'Vererbung', 'Evolution',
      'Menschlicher Körper', 'Nahrungskette',
    ],
    'Physik': [
      'Ohmsches Gesetz', 'Kräfte und Bewegung', 'Energieumwandlung',
      'Stromkreis', 'Wärmelehre', 'Optik', 'Hebelgesetz',
    ],
    'Chemie': [
      'Periodensystem', 'Säuren und Basen', 'Atombau', 'Reaktionsgleichungen',
      'Oxidation und Reduktion', 'Organische Chemie',
    ],
    'Informatik': [
      'Algorithmen', 'Variablen und Schleifen', 'Datenbanken',
      'Datenschutz', 'Binärsystem',
    ],
    'Musik': ['Noten lesen', 'Rhythmus', 'Musikepochen', 'Instrumente'],
    'Kunst': ['Farbenlehre', 'Perspektive', 'Kunststile'],
    'Ethik': ['Ethische Dilemmata', 'Menschenrechte', 'Wertvorstellungen'],
    'Religion': ['Weltreligionen', 'Religiöse Feste', 'Biblische Texte'],
    'Sport': ['Spielregeln', 'Aufwärmen', 'Fair Play'],
  }
  return map[s] || []
})

const isLanguageSubject = computed(() => {
  return ['Deutsch', 'Englisch', 'English', 'Français', 'French', 'Español', 'Spanish', 'Italiano', 'Italian', 'Nederlands', 'Dutch'].includes(form.value.subject || '')
})

function getRouteWorksheetId() {
  if (!route.params.id) return null
  return Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
}

function mapLoadedBlocks(rawBlocks) {
  return (rawBlocks || []).map((block) => {
    const loaded = { ...block }
    loaded.text = loaded.text || ''
    if (loaded.type === 'short_answer') {
      loaded.keywordsStr = loaded.keywords ? loaded.keywords.join(', ') : ''
    }
    if (loaded.type === 'graph_plot') {
      loaded.pointsStr = JSON.stringify(loaded.points_to_plot || [])
    }
    if (loaded.type === 'number_line') {
      loaded.min_value = loaded.min_value ?? 0
      loaded.max_value = loaded.max_value ?? 100
      loaded.markers = loaded.markers ?? [50]
    }
    if (loaded.type === 'equation_entry') {
      loaded.equation = loaded.equation || ''
      loaded.final_answer = loaded.final_answer || ''
    }
    if (loaded.type === 'fraction_input') {
      loaded.numerator = loaded.numerator ?? 1
      loaded.denominator = loaded.denominator ?? 2
    }
    if (loaded.type === 'fraction_model') {
      loaded.numerator = loaded.numerator ?? 3
      loaded.denominator = loaded.denominator ?? 4
      loaded.model_type = loaded.model_type || 'circle'
      loaded.show_labels = loaded.show_labels ?? true
    }
    if (loaded.type === 'arithmetic_grid') {
      loaded.operand1 = loaded.operand1 ?? 0
      loaded.operand2 = loaded.operand2 ?? 0
      loaded.operation = loaded.operation || 'add'
    }
    if (loaded.type === 'geometry_shape') {
      loaded.shape_type = loaded.shape_type || 'triangle'
    }
    if (loaded.type === 'word_problem') {
      loaded.problem_text = loaded.problem_text || ''
      loaded.steps = loaded.steps || [{ description: '', expected: '' }]
      loaded.final_answer = loaded.final_answer || ''
    }
    if (loaded.type === 'matching') {
      loaded.pairs = loaded.pairs || [
        ['', ''],
        ['', ''],
      ]
    }
    if (loaded.type === 'multiple_choice' || loaded.type === 'single_choice') {
      loaded.options = loaded.options || ['', '', '']
      loaded.correct =
        loaded.type === 'single_choice' ? (loaded.correct ?? 0) : loaded.correct || []
    }
    if (loaded.type === 'true_false') {
      loaded.correct_answer = loaded.correct_answer ?? true
    }
    if (loaded.type === 'ordering') {
      loaded.items = loaded.items || ['', '', '']
    }
    if (loaded.type === 'percentage') {
      loaded.percentage_value = loaded.percentage_value ?? 20
      loaded.part_value = loaded.part_value ?? 10
      loaded.whole_value = loaded.whole_value ?? 50
    }
    if (loaded.type === 'unit_conversion') {
      loaded.value = loaded.value ?? 150
      loaded.from_unit = loaded.from_unit ?? 'cm'
      loaded.to_unit = loaded.to_unit ?? 'm'
    }
    if (loaded.type === 'angle') {
      loaded.expected_degrees = loaded.expected_degrees ?? 90
      loaded.angle_type = loaded.angle_type ?? 'identify'
    }
    if (loaded.type === 'drawing') {
      loaded.canvas_width = loaded.canvas_width ?? 600
      loaded.canvas_height = loaded.canvas_height ?? 400
      loaded.background_image = loaded.background_image ?? ''
    }
    if (loaded.type === 'vocabulary') {
      loaded.vocabulary = loaded.vocabulary || { pairs: [], direction: 'l2r' }
      if (Array.isArray(loaded.vocabulary)) {
        loaded.vocabulary = { pairs: loaded.vocabulary, direction: 'l2r' }
      }
      loaded.vocabulary.pairs = loaded.vocabulary.pairs || []
    }
    if (loaded.type === 'semantic_sorter') {
      loaded.categories = loaded.categories || []
    }
    if (loaded.type === 'flashcards') {
      loaded.cards = loaded.cards || []
    }
    if (loaded.type === 'drag_words' || loaded.type === 'correct_words') {
      loaded.template = loaded.template || ''
    }
    if (loaded.type === 'question_table') {
      loaded.columns = loaded.columns || []
      loaded.rows = loaded.rows || []
      loaded.columnsStr = loaded.columns.join('\n')
      loaded.rowsStr = loaded.rows.join('\n')
    }
    if (loaded.type === 'crossword' || loaded.type === 'word_search') {
      loaded.words = loaded.words || []
      if (loaded.type === 'word_search') {
        loaded.wordsStr = loaded.words.join(', ')
      }
    }
    if (loaded.type === 'audio_match') {
      loaded.pairs = loaded.pairs || []
      loaded.voice = loaded.voice || ''
    }
    if (loaded.type === 'dictation') {
      loaded.audioText = loaded.audioText || ''
      loaded.voice = loaded.voice || ''
      loaded.audioUrl = loaded.audioUrl || ''
    }
    if (loaded.type === 'sentence_builder') {
      loaded.sentence = loaded.sentence || ''
    }
    if (loaded.type === 'odd_one_out') {
      loaded.items = loaded.items || []
      loaded.correct = typeof loaded.correct === 'number' ? loaded.correct : 0
      loaded.reason = loaded.reason || ''
    }
    return loaded
  })
}

async function syncBuilderToRoute() {
  const worksheetId = getRouteWorksheetId()
  if (!worksheetId) {
    isEditing.value = false
    form.value = emptyForm()
    blocks.value = []
    versionHistory.value = []
    showSetupModal.value = true
    return
  }
  isEditing.value = true
  try {
    await store.fetchWorksheet(worksheetId)
    if (!store.current) {
      form.value = emptyForm()
      blocks.value = []
      isEditing.value = false
      return
    }
    form.value = {
      title: store.current.title || '',
      subject: store.current.subject || '',
      grade_level: store.current.grade_level || '',
      description: store.current.description || '',
      pupil_profile: 'default',
    }
    try {
      const content = JSON.parse(store.current.content || '{}')
      blocks.value = mapLoadedBlocks(content.blocks)
      form.value.pupil_profile = content.pupil_profile || 'default'
      if (blocks.value.length > 0) {
        expandedBlockId.value = blocks.value[0].id
      }
    } catch {
      blocks.value = []
    }
    await loadVersions()
    showSetupModal.value = false
  } catch {
    uiStore.showToast('Failed to load worksheet', 'error')
    resetBuilder()
  }
}

onMounted(async () => {
  try {
    const [subData, gradeData] = await Promise.all([
      api.get('/worksheets/subjects'),
      api.get('/worksheets/grade-levels'),
    ])
    subjects.value = subData.subjects || []
    gradeLevels.value = gradeData.gradeLevels || []
  } catch {
    /* */
  }
  await syncBuilderToRoute()
})

watch(
  () => route.fullPath,
  () => {
    syncBuilderToRoute()
  },
)

function genId() {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2)
}

function tryParsePoints(block) {
  try {
    block.points_to_plot = JSON.parse(block.pointsStr)
  } catch {
    /* */
  }
}

function updateBlockPoints(block) {
  let count = 0
  if (block.type === 'gap_fill' || block.type === 'drag_words' || block.type === 'correct_words') {
    count = (block.template?.match(/\(\(.*?\)\)/g) || []).length
  } else if (block.type === 'multiple_choice' || block.type === 'single_choice') {
    count = (block.options || []).filter(Boolean).length
  } else if (block.type === 'matching' || block.type === 'audio_match') {
    count = (block.pairs || []).filter((p) => p[0] || p[1]).length
  } else if (block.type === 'word_scramble') {
    count = (block.words || []).filter((w) => w.word).length
  } else if (block.type === 'vocabulary') {
    const pairs = Array.isArray(block.vocabulary)
      ? block.vocabulary
      : (block.vocabulary?.pairs || [])
    count = pairs.filter((p) => p.l || p.r).length
  } else if (block.type === 'semantic_sorter') {
    count = (block.categories || []).reduce(
      (sum, cat) => sum + (cat.words || []).filter(Boolean).length,
      0,
    )
  } else if (block.type === 'flashcards') {
    count = (block.cards || []).filter((c) => c.front || c.back).length
  } else if (block.type === 'question_table') {
    count = (block.rows || []).filter(Boolean).length
  } else if (block.type === 'crossword' || block.type === 'word_search') {
    count = (block.words || []).filter((w) => typeof w === 'string' ? w : w.word).length
  } else if (block.type === 'dictation') {
    block.points = 8
    return
  } else if (block.type === 'sentence_builder' || block.type === 'odd_one_out') {
    block.points = 6
    return
  } else if (block.type === 'short_answer') {
    count = (block.keywordsStr || '')
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean).length
    if (count === 0) count = 1
  } else {
    return
  }
  block.points = count * 2
}

function renameAnswerKey(block, oldKey, newKey) {
  if (!newKey || oldKey === newKey) return
  if (!block.answers) block.answers = {}
  if (block.answers[newKey] !== undefined) return
  const val = block.answers[oldKey]
  delete block.answers[oldKey]
  block.answers[newKey] = val
  updateBlockPoints(block)
}

function deleteAnswerKey(block, key) {
  if (!block.answers) return
  delete block.answers[key]
  block.items = Object.values(block.answers).filter(Boolean)
  updateBlockPoints(block)
}

function addAnswerKey(block) {
  if (!block.answers) block.answers = {}
  let baseName = 'slot'
  let count = 1
  while (block.answers[`${baseName}${count}`] !== undefined) {
    count++
  }
  block.answers[`${baseName}${count}`] = ''
  block.items = Object.values(block.answers).filter(Boolean)
  updateBlockPoints(block)
}

function autoExpand(event) {
  const target = event && event.target
  if (!target) return
  target.style.height = 'auto'
  target.style.height = `${target.scrollHeight}px`
}

function inferMimeType(src, kind) {
  const normalized = String(src || '').toLowerCase()
  if (kind === 'audio') {
    if (normalized.endsWith('.mp3')) return 'audio/mpeg'
    if (normalized.endsWith('.wav')) return 'audio/wav'
    if (normalized.endsWith('.ogg')) return 'audio/ogg'
    if (normalized.endsWith('.m4a')) return 'audio/mp4'
    return 'audio/mpeg'
  }

  if (normalized.endsWith('.webm')) return 'video/webm'
  if (normalized.endsWith('.mov')) return 'video/quicktime'
  return 'video/mp4'
}

/* ---- Fraction model SVG helpers ---- */
function fractionIndices(block) {
  const n = Math.max(1, Math.min(block.denominator || 1, 20))
  return Array.from({ length: n }, (_, i) => i)
}

function fractionViewBox(block) {
  return block.model_type === 'circle' ? '0 0 200 200' : '0 0 240 90'
}

function fractionSvgWidth(block) {
  return block.model_type === 'circle' ? 180 : 240
}

function fractionSvgHeight(block) {
  return block.model_type === 'circle' ? 180 : 90
}

function fractionSlicePath(index, block) {
  const n = Math.max(1, Math.min(block.denominator || 1, 20))
  if (n === 0) return ''
  const cx = 100, cy = 100, r = 95
  const angle = (2 * Math.PI) / n
  const startAngle = angle * index - Math.PI / 2
  const endAngle = startAngle + angle
  const x1 = cx + r * Math.cos(startAngle)
  const y1 = cy + r * Math.sin(startAngle)
  const x2 = cx + r * Math.cos(endAngle)
  const y2 = cy + r * Math.sin(endAngle)
  const largeArc = angle > Math.PI ? 1 : 0
  return `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`
}

function canAiRegenerate(type) {
  return !['media', 'audio', 'video', 'youtube', 'drawing'].includes(type)
}

function addBlock(type) {
  const block = {
    id: genId(),
    type,
    points:
      type === 'media' ||
      type === 'audio' ||
      type === 'video' ||
      type === 'youtube' ||
      type === 'text' ||
      type === 'read_aloud' ||
      type === 'drawing'
        ? 0
        : 10,
    text: '',
  }
  if (type === 'gap_fill') block.template = ''
  if (type === 'multiple_choice' || type === 'single_choice') {
    block.options = ['', '', '']
    block.correct = type === 'single_choice' ? 0 : []
  }
  if (type === 'matching')
    block.pairs = [
      ['', ''],
      ['', ''],
    ]
  if (type === 'short_answer') {
    block.sample_answer = ''
    block.keywordsStr = ''
  }
  if (type === 'word_scramble') block.words = [{ word: '' }, { word: '' }]
  if (type === 'info_box') {
    block.points = 0
    block.title = 'Did you know?'
    block.text = 'Explanation content here...'
    block.mermaid = ''
    block.alt_text = ''
  }
  if (type === 'media' || type === 'audio' || type === 'video' || type === 'youtube') {
    block.src = ''
    block.caption = ''
  }
  if (type === 'true_false') {
    block.correct_answer = true
  }
  if (type === 'ordering') {
    block.items = ['', '', '']
  }
  if (type === 'vocabulary') {
    block.points = 10
    block.vocabulary = { pairs: [{ l: '', r: '' }, { l: '', r: '' }], direction: 'l2r' }
  }
  if (type === 'semantic_sorter') {
    block.points = 6
    block.categories = [{ name: 'Category 1', words: ['item1', 'item2'] }, { name: 'Category 2', words: ['item3'] }]
  }
  if (type === 'flashcards') {
    block.points = 0
    block.cards = [{ front: '', back: '', image_url: '', audio_url: '' }, { front: '', back: '', image_url: '', audio_url: '' }]
  }
  if (type === 'drag_words') {
    block.points = 6
    block.template = 'Learning ((flow)) is ((fun)).'
  }
  if (type === 'correct_words') {
    block.points = 6
    block.template = 'She ((go/goes)) to school and ((play/plays)) soccer.'
  }
  if (type === 'question_table') {
    block.points = 6
    block.columns = ['True', 'False']
    block.rows = ['The sun is a star##True', 'The moon is made of cheese##False']
  }
  if (type === 'crossword') {
    block.points = 6
    block.words = [{ word: 'HELLO', description: 'A greeting' }, { word: 'WORLD', description: 'Our planet' }]
  }
  if (type === 'audio_match') {
    block.points = 6
    block.pairs = [['Good morning', 'Guten Morgen'], ['Hello', 'Hallo']]
    block.voice = 'de-DE-KatjaNeural'
  }
  if (type === 'dictation') {
    block.points = 8
    block.audioText = 'Welcome to learnflow.'
    block.voice = 'en-US-JennyNeural'
    block.audioUrl = ''
  }
  if (type === 'word_search') {
    block.points = 6
    block.words = ['APPLE', 'BANANA', 'ORANGE']
  }
  if (type === 'sentence_builder') {
    block.points = 6
    block.sentence = 'The quick brown fox jumps.'
  }
  if (type === 'odd_one_out') {
    block.points = 6
    block.items = ['Apple', 'Banana', 'Carrot']
    block.correct = 2
    block.reason = 'Carrot is a vegetable, others are fruits.'
  }
  if (type === 'drawing') {
    block.canvas_width = 600
    block.canvas_height = 400
    block.background_image = ''
  }
  blocks.value.push(block)
  expandedBlockId.value = block.id
}

function removeBlock(idx) {
  blocks.value.splice(idx, 1)
}

function moveBlock(idx, delta) {
  const newIdx = idx + delta
  ;[blocks.value[idx], blocks.value[newIdx]] = [blocks.value[newIdx], blocks.value[idx]]
}

function resetBuilder() {
  isEditing.value = false
  form.value = emptyForm()
  blocks.value = []
  versionHistory.value = []
  differentiatedConcept.value = null
  conceptInput.value = ''
}

async function loadVersions() {
  const worksheetId = getRouteWorksheetId()
  if (!worksheetId) return
  versionLoading.value = true
  try {
    versionHistory.value = await store.fetchWorksheetVersions(worksheetId)
  } catch {
    versionHistory.value = []
  } finally {
    versionLoading.value = false
  }
}

function formatVersionDate(value) {
  if (!value) return 'Unknown date'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Unknown date' : date.toLocaleString()
}

async function restoreVersion(versionId) {
  const worksheetId = getRouteWorksheetId()
  if (!worksheetId) return
  if (!confirm('Restore this worksheet version? Current content will be replaced.')) return
  try {
    await store.restoreWorksheetVersion(worksheetId, versionId)
    await syncBuilderToRoute()
    uiStore.showToast('Worksheet version restored', 'success')
  } catch (e) {
    uiStore.showToast(e.message || 'Failed to restore version', 'error')
  }
}

async function differentiateConcept() {
  if (!conceptInput.value.trim()) return
  if (!form.value.subject || !form.value.grade_level) {
    uiStore.showToast('Please select subject and grade level first', 'error')
    return
  }
  differentiateLoading.value = true
  try {
    differentiatedConcept.value = await store.aiDifferentiateConcept({
      concept: conceptInput.value.trim(),
      subject: form.value.subject,
      grade_level: form.value.grade_level,
      provider: aiProvider.value,
    })
    uiStore.showToast('Differentiated explanations ready', 'success')
  } catch (e) {
    uiStore.showToast(e.message || 'Failed to differentiate concept', 'error')
  } finally {
    differentiateLoading.value = false
  }
}

function insertDifferentiatedInfoBox() {
  if (!differentiatedConcept.value) return
  blocks.value.unshift({
    id: genId(),
    type: 'info_box',
    points: 0,
    title: conceptInput.value.trim() || 'Differentiated concept support',
    text: `Basic:\n${differentiatedConcept.value.basic}\n\nStandard:\n${differentiatedConcept.value.standard}\n\nAdvanced:\n${differentiatedConcept.value.advanced}`,
    mermaid: '',
    alt_text: '',
  })
  uiStore.showToast('Info box added', 'success')
}

async function save() {
  const worksheetId = getRouteWorksheetId()
  const mappedBlocks = blocks.value.map((b) => {
    updateBlockPoints(b)
    const copy = { ...b }
    if (copy.type === 'short_answer') {
      copy.keywords = (copy.keywordsStr || '')
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean)
    }
    return copy
  })
  const content = JSON.stringify({ blocks: mappedBlocks, pupil_profile: form.value.pupil_profile || 'default' })
  const totalPoints = blocks.value.reduce((s, b) => s + (b.points || 0), 0)
  const payload = {
    ...form.value,
    content,
    total_points: totalPoints,
    change_summary: isEditing.value ? 'Updated from worksheet builder' : 'Initial version',
  }
  try {
    if (isEditing.value && worksheetId) {
      await store.updateWorksheet(worksheetId, payload)
      await loadVersions()
    } else {
      const ws = await store.createWorksheet(payload)
      router.push(`/teacher/builder/${ws.id}`)
    }
    uiStore.showToast('Saved', 'success')
  } catch (e) {
    uiStore.showToast(e.message, 'error')
  }
}

async function goToPreview() {
  const worksheetId = getRouteWorksheetId()
  const mappedBlocks = blocks.value.map((b) => {
    updateBlockPoints(b)
    const copy = { ...b }
    if (copy.type === 'short_answer') {
      copy.keywords = (copy.keywordsStr || '')
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean)
    }
    return copy
  })
  const content = JSON.stringify({ blocks: mappedBlocks, pupil_profile: form.value.pupil_profile || 'default' })
  const totalPoints = blocks.value.reduce((s, b) => s + (b.points || 0), 0)
  const payload = {
    ...form.value,
    content,
    total_points: totalPoints,
    change_summary: isEditing.value ? 'Updated from worksheet builder' : 'Initial version',
  }
  try {
    if (isEditing.value && worksheetId) {
      await store.updateWorksheet(worksheetId, payload)
      await loadVersions()
      router.push(`/teacher/preview/${worksheetId}`)
    } else {
      const ws = await store.createWorksheet(payload)
      router.push(`/teacher/preview/${ws.id}`)
    }
    uiStore.showToast('Saved & Opened Preview', 'success')
  } catch (e) {
    uiStore.showToast(e.message, 'error')
  }
}

async function submitSetup() {
  if (!form.value.title?.trim()) {
    uiStore.showToast('Please enter a worksheet title', 'error')
    return
  }
  if (!form.value.subject) {
    uiStore.showToast('Please select a subject', 'error')
    return
  }
  if (!form.value.grade_level) {
    uiStore.showToast('Please select a class/grade level', 'error')
    return
  }
  try {
    await save()
    showSetupModal.value = false
  } catch (e) {
    uiStore.showToast(e.message || 'Failed to save worksheet details', 'error')
  }
}

async function generateBlockAudio(block, text, targetField = 'audioUrl') {
  if (!text) {
    uiStore.showToast('Please enter text to generate audio for', 'error')
    return
  }
  try {
    block.audioLoading = true
    const res = await store.generateTTS(text, block.voice || 'en-US-JennyNeural')
    block[targetField] = res.url
    uiStore.showToast('Audio generated successfully', 'success')
  } catch (e) {
    uiStore.showToast(e.message || 'Failed to generate TTS audio', 'error')
  } finally {
    block.audioLoading = false
  }
}

async function generateAudioMatchAudios(block) {
  try {
    block.audioLoading = true
    const urls = []
    for (let i = 0; i < (block.pairs || []).length; i++) {
      const text = block.pairs[i][0]
      if (text) {
        const res = await store.generateTTS(text, block.voice || 'en-US-JennyNeural')
        urls.push(res.url)
      } else {
        urls.push('')
      }
    }
    block.audioUrls = urls
    uiStore.showToast('All audios generated successfully', 'success')
  } catch (e) {
    uiStore.showToast(e.message || 'Failed to generate audios', 'error')
  } finally {
    block.audioLoading = false
  }
}

const showAiPreviewModal = ref(false)
const aiPreviewBlocks = ref([])

function keepAiGeneratedBlocks() {
  if (aiPreviewBlocks.value.length) {
    blocks.value.push(...aiPreviewBlocks.value)
    expandedBlockId.value = aiPreviewBlocks.value[0].id
  }
  aiPreviewBlocks.value = []
  showAiPreviewModal.value = false
  uiStore.showToast('Blocks added to worksheet', 'success')
}

function discardAiGeneratedBlocks() {
  aiPreviewBlocks.value = []
  showAiPreviewModal.value = false
}

async function generateAI() {
  if (!aiPrompt.value.trim()) return
  if (!form.value.subject || !form.value.grade_level) {
    uiStore.showToast('Please select subject and grade level first', 'error')
    return
  }
  aiLoading.value = true
  try {
    // Default length to long for worksheets generated via the simplified generator
    const data = await store.aiGenerate(aiPrompt.value, aiProvider.value, {
      difficulty: 'medium',
      length: 'long',
      subject: form.value.subject,
      grade_level: form.value.grade_level,
      title: form.value.title || undefined,
      description: form.value.description || undefined,
      style: 'practice',
      source_lang: form.value.source_lang || undefined,
      target_lang: form.value.target_lang || undefined,
      cefr_level: form.value.cefr_level || undefined,
    })
    aiPreviewBlocks.value = mapLoadedBlocks(data.blocks)
    showAiPreviewModal.value = true
  } catch (e) {
    uiStore.showToast(e.message, 'error')
  } finally {
    aiLoading.value = false
  }
}

async function sidebarGenerate() {
  await generateAI()
}

async function regenerateBlock(idx) {
  const block = blocks.value[idx]
  if (!block) return
  if (!canAiRegenerate(block.type)) {
    uiStore.showToast('AI regenerate is not available for uploaded media blocks', 'error')
    return
  }
  aiLoading.value = true
  try {
    const data = await store.aiRegenerateBlock({
      blockType: block.type,
      prompt: aiPrompt.value || undefined,
      currentBlock: block,
      worksheetContext: {
        title: form.value.title || undefined,
        description: form.value.description || undefined,
        previousBlock: idx > 0 ? blocks.value[idx - 1] : undefined,
        nextBlock: idx < blocks.value.length - 1 ? blocks.value[idx + 1] : undefined,
      },
      provider: aiProvider.value,
      difficulty: aiDifficulty.value,
      subject: form.value.subject || undefined,
      grade_level: form.value.grade_level || undefined,
      lernziele: aiLernziele.value.trim() || undefined,
      style: aiStyle.value,
    })
    const mapped = mapLoadedBlocks([data.block])[0]
    blocks.value[idx] = { ...blocks.value[idx], ...mapped }
    uiStore.showToast(`Block "${block.type}" regenerated`, 'success')
  } catch (e) {
    uiStore.showToast(e.message || 'Failed to regenerate block', 'error')
  } finally {
    aiLoading.value = false
  }
}

async function regenerateBlockWithInstruction(idx, instruction) {
  const block = blocks.value[idx]
  if (!block) return
  if (!canAiRegenerate(block.type)) {
    uiStore.showToast('AI regenerate is not available for uploaded media blocks', 'error')
    return
  }
  aiLoading.value = true
  try {
    const prompt = `${aiPrompt.value ? aiPrompt.value + '. ' : ''}Regenerate to be ${instruction}. ${block.text || block.template || ''}`
    const data = await store.aiRegenerateBlock({
      blockType: block.type,
      prompt,
      currentBlock: block,
      worksheetContext: {
        title: form.value.title || undefined,
        description: form.value.description || undefined,
        previousBlock: idx > 0 ? blocks.value[idx - 1] : undefined,
        nextBlock: idx < blocks.value.length - 1 ? blocks.value[idx + 1] : undefined,
      },
      provider: aiProvider.value,
      difficulty: instruction === 'easier' ? 'easy' : instruction === 'harder' ? 'hard' : aiDifficulty.value,
      subject: form.value.subject || undefined,
      grade_level: form.value.grade_level || undefined,
      lernziele: aiLernziele.value.trim() || undefined,
      style: aiStyle.value,
    })
    const mapped = mapLoadedBlocks([data.block])[0]
    blocks.value[idx] = { ...blocks.value[idx], ...mapped }
    uiStore.showToast(`Block made ${instruction}`, 'success')
  } catch (e) {
    uiStore.showToast(e.message || 'Failed to regenerate block', 'error')
  } finally {
    aiLoading.value = false
  }
}

function isYoutube(url) {
  return /youtube\.com|youtu\.be/.test(url)
}
function youtubeEmbed(url) {
  const id = url.match(/(?:v=|\/)([\w-]{11})/)
  return id ? `https://www.youtube.com/embed/${id[1]}` : ''
}

async function uploadFile(event, block) {
  const file = event.target.files?.[0]
  if (!file) return
  const formData = new FormData()
  formData.append('file', file)
  try {
    const data = await api.upload('/media/upload', formData)
    block.src = data.media.url
    block.mime_type = data.media.mime_type
    uiStore.showToast('Uploaded', 'success')
  } catch (e) {
    uiStore.showToast(e.message, 'error')
  }
}
</script>

<style scoped>
/* ===== Builder Page Layout ===== */
.builder-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem 1.25rem 2.5rem;
}

.builder-layout {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

/* ===== Left Sidebar ===== */
.builder-sidebar {
  width: 300px;
  min-width: 300px;
  position: sticky;
  top: calc(4.5rem);
  max-height: calc(100vh - 5.5rem);
  overflow-y: auto;
  align-self: flex-start;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding-right: 0.25rem;
}

.builder-sidebar::-webkit-scrollbar {
  width: 3px;
}

/* Sidebar header */
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.sidebar-header-title h2 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  background: var(--gradient-text);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  white-space: nowrap;
}

/* Sidebar card (settings) */
.sidebar-card {
  padding: 0.85rem;
}

.sidebar-card .form-group label {
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
  margin-bottom: 0.2rem;
}

.sidebar-card input,
.sidebar-card textarea,
.sidebar-card select {
  font-size: 0.78rem;
  padding: 0.35rem 0.5rem;
}

/* Sidebar sections */
.sidebar-section {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.sidebar-heading {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin: 0;
  padding: 0 0.15rem;
}

/* Block toolbar grid */
.block-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.3rem;
}

.block-btn {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.32rem 0.4rem;
  font-size: 0.68rem;
  font-weight: 500;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
}

.block-btn:hover {
  border-color: var(--primary-soft);
  background: var(--primary-light);
  color: var(--primary);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.block-btn:active {
  transform: translateY(0);
}

.block-btn-icon {
  font-size: 0.9rem;
  flex-shrink: 0;
}

/* Collapsible panels */
.collapse-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.4rem 0.5rem;
  font-size: 0.78rem;
  font-weight: 600;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-main);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
}

.collapse-toggle:hover {
  background: var(--bg-hover);
  border-color: var(--primary-soft);
  color: var(--primary);
}

.collapse-toggle-label {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.collapse-arrow {
  font-size: 0.65rem;
  color: var(--text-muted);
  transition: transform var(--transition-fast);
}

.collapse-arrow.open {
  transform: rotate(180deg);
}

.collapse-content {
  padding: 0.45rem 0 0;
  display: flex;
  flex-direction: column;
}

/* ===== Right Main ===== */
.builder-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

/* Block cards */
.block-card {
  padding: 1rem;
  transition: all var(--transition);
  animation: fadeUp 0.25s ease both;
}

.block-card:hover {
  border-color: var(--primary-soft);
  box-shadow: var(--shadow-md);
}

.block-card.is-collapsed {
  padding: 0.6rem 1rem !important;
  margin-bottom: 0.35rem;
  border-color: var(--border-color);
  box-shadow: none !important;
  cursor: pointer;
}
.block-card.is-collapsed:hover {
  border-color: var(--primary-soft);
  background: var(--bg-main);
}
.block-card.is-collapsed .block-card-header {
  margin-bottom: 0 !important;
}

/* Block card header */
.block-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.block-card-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.block-type-icon {
  font-size: 1.15rem;
  flex-shrink: 0;
}

.block-card-title strong {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: capitalize;
  letter-spacing: 0.01em;
}

.block-card-controls {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  flex-shrink: 0;
}

.pts-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-muted);
  margin: 0;
  display: inline;
}

.pts-input {
  width: 52px;
  font-size: 0.72rem !important;
  padding: 0.2rem 0.35rem !important;
  text-align: center;
}

/* AI regenerate toolbar */
.block-ai-toolbar {
  display: flex;
  gap: 0.3rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 0.5rem;
}

/* Block card body */
.block-card-body {
  font-size: 0.82rem;
}

.block-card-body .form-group {
  margin-bottom: 0.5rem;
}

.block-card-body label {
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
  margin-bottom: 0.2rem;
}

.block-card-body input,
.block-card-body textarea,
.block-card-body select {
  font-size: 0.8rem;
  padding: 0.4rem 0.55rem;
}

/* Details/summary (Mermaid) */
.block-card-body details {
  margin-top: 0.6rem;
}

.block-card-body details summary {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-muted);
  cursor: pointer;
  transition: color var(--transition-fast);
}

.block-card-body details summary:hover {
  color: var(--primary);
}

/* Animation for block cards */
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Empty state */
.builder-main .empty-state p {
  font-size: 0.9rem;
  color: var(--text-muted);
}

/* Responsive: stack on narrow screens */
@media (max-width: 900px) {
  .builder-layout {
    flex-direction: column;
  }
  .builder-sidebar {
    width: 100%;
    min-width: 100%;
    position: static;
    max-height: none;
  }
}

/* ===== Setup Modal Styles ===== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-container {
  width: 100%;
  max-width: 500px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-xl);
  padding: 2rem;
  border-radius: 16px;
  animation: modal-fadeIn 0.3s ease-out;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-main);
}

.modal-header p {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin: 0.35rem 0 1.25rem;
}

@keyframes modal-fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
