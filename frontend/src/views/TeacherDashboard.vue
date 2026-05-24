<template>
  <div class="page">
    <div style="display: flex; justify-content: space-between; align-items: center">
      <h2>Teacher Dashboard</h2>
      <router-link to="/teacher/builder" class="btn-primary">Create Worksheet</router-link>
    </div>

    <div style="display: flex; gap: 0.5rem; margin: 1rem 0">
      <button :class="{ 'btn-primary': tab === 'worksheets' }" @click="tab = 'worksheets'">
        Worksheets
      </button>
      <button :class="{ 'btn-primary': tab === 'classes' }" @click="tab = 'classes'">
        Classes
      </button>
      <button :class="{ 'btn-primary': tab === 'courses' }" @click="tab = 'courses'">
        Courses
      </button>
      <button :class="{ 'btn-primary': tab === 'results' }" @click="tab = 'results'">
        Results
      </button>
      <button :class="{ 'btn-primary': tab === 'analytics' }" @click="tab = 'analytics'">
        Analytics
      </button>
    </div>

    <template v-if="tab === 'worksheets'">
      <div class="card" style="margin-bottom: 1rem; padding: 0.75rem 1.25rem;">
        <div style="display: flex; gap: 0.5rem; align-items: center;">
          <label style="font-weight: 600; font-size: 0.9rem; color: var(--text-muted);">Search:</label>
          <input v-model="searchQuery" placeholder="Filter worksheets by title, subject, or grade..." style="flex: 1; padding: 0.4rem 0.75rem;" />
        </div>
      </div>

      <div v-if="filteredWorksheets.length === 0" style="color: var(--text-muted); text-align: center; padding: 2rem;">
        No matching worksheets found
      </div>
      <div v-for="ws in filteredWorksheets" :key="ws.id" class="card" style="margin-bottom: 0.5rem">
        <div style="display: flex; justify-content: space-between; align-items: center">
          <div>
            <strong>{{ ws.title }}</strong>
            <span style="color: var(--text-muted); font-size: 0.85rem; margin-left: 0.5rem">{{
              ws.subject
            }}</span>
          </div>
          <div style="display: flex; gap: 0.25rem">
            <button class="btn-sm" @click="editWs(ws.id)">Edit</button>
            <button class="btn-sm" @click="previewWs(ws.id)">Preview</button>
            <button class="btn-sm" @click="duplicateWs(ws.id)">Copy</button>
            <button class="btn-sm" @click="assignWs(ws)">Assign</button>
            <button class="btn-sm btn-danger" @click="deleteWs(ws.id)">Delete</button>
          </div>
        </div>
        <div
          v-if="assignTarget && assignTarget.id === ws.id"
          style="margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid var(--border-color)"
        >
          <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap">
            <select v-model="assignForm.class_id" style="width: 200px">
              <option value="">Select class...</option>
              <option v-for="c in classesList" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
            <input v-model="assignForm.due_date" type="date" style="width: 150px" />
            <select v-model="assignForm.retry_policy" style="width: 120px">
              <option value="single">Single</option>
              <option value="best">Best</option>
              <option value="latest">Latest</option>
            </select>
            <button class="btn-primary btn-sm" @click="doAssign(ws.id)">Assign</button>
            <button class="btn-sm" @click="assignTarget = null">Cancel</button>
          </div>
        </div>
      </div>

      <div class="card" style="margin-top: 1rem">
        <h3>New Class</h3>
        <div style="display: flex; gap: 0.5rem">
          <input v-model="newClassName" placeholder="Class name" />
          <button class="btn-primary" @click="createClass">Create</button>
        </div>
      </div>
    </template>

    <template v-if="tab === 'classes'">
      <div v-if="classesList.length === 0" style="color: var(--text-muted)">No classes yet</div>
      <div v-for="c in classesList" :key="c.id" class="card" style="margin-bottom: 1.5rem; border-top: 3px solid var(--primary);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
          <div>
            <strong style="font-size: 1.2rem;">{{ c.name }}</strong>
            <span class="badge" style="margin-left: 0.5rem; background: rgba(79, 70, 229, 0.1); color: var(--primary);">Code: {{ c.class_code }}</span>
          </div>
          <div style="display: flex; gap: 0.25rem">
            <button class="btn-primary btn-sm" @click="viewClassProgress(c.id)">
              {{ selectedClass === c.id ? 'Hide Progress' : 'View Progress' }}
            </button>
            <button class="btn-sm" @click="exportCsv(c.id)">Export CSV</button>
            <button class="btn-sm btn-danger" @click="deleteClass(c.id)">Delete</button>
          </div>
        </div>
        
        <div v-if="selectedClass === c.id" style="margin-top: 1rem;">
          <div v-if="classProgress.length === 0" style="color: var(--text-muted); font-size: 0.9rem; padding: 1rem 0;">
            No students enrolled in this class yet.
          </div>
          <div v-else class="student-grid">
            <div
              v-for="p in classProgress"
              :key="p.student.id"
              class="student-progress-card"
              :class="{ 'at-risk': p.total > 0 && (p.completed / p.total) < 0.5 }"
            >
              <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
                <span 
                  class="student-emoji streak-aura"
                  :class="p.student.streak_days >= 7 ? 'streak-level-3' : (p.student.streak_days >= 3 ? 'streak-level-2' : (p.student.streak_days >= 1 ? 'streak-level-1' : ''))"
                >
                  {{ p.student.character_emoji || '👤' }}
                </span>
                <div style="flex: 1; min-width: 0;">
                  <h4 style="margin: 0; font-size: 0.95rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    {{ p.student.name }}
                  </h4>
                  <div style="font-size: 0.75rem; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    @{{ p.student.username }}
                  </div>
                </div>
                <span
                  v-if="p.total > 0 && (p.completed / p.total) < 0.5"
                  class="status-badge risk-badge"
                >
                  ⚠️ At Risk
                </span>
                <span
                  v-else-if="p.total > 0 && p.completed === p.total"
                  class="status-badge complete-badge"
                >
                  ✅ Done
                </span>
                <span
                  v-else
                  class="status-badge track-badge"
                >
                  On Track
                </span>
              </div>
              <div style="font-size: 0.8rem; display: flex; justify-content: space-between; margin-bottom: 0.35rem;">
                <span style="color: var(--text-muted);">Completed:</span>
                <span style="font-weight: 700; color: var(--text-main);">{{ p.completed }} / {{ p.total }}</span>
              </div>
              <div class="progress-bar-container">
                <div
                  class="progress-bar"
                  :style="{
                    width: (p.total > 0 ? (p.completed / p.total) * 100 : 0) + '%',
                    background: p.total > 0 && (p.completed / p.total) < 0.5 ? 'var(--danger)' : 'var(--success)'
                  }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-if="tab === 'results'">
      <div v-if="!selectedAssignment" style="color: var(--text-muted)">
        Select a worksheet and assignment first
      </div>
      <div v-else>
        <h3>Results for {{ selectedAssignment.worksheet_title }}</h3>
        <table v-if="results.length">
          <thead>
            <tr>
              <th>Student</th>
              <th>Score</th>
              <th>Submitted</th>
              <th>Feedback</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in results" :key="r.id">
              <td>{{ r.student_name }}</td>
              <td>{{ r.score }}/{{ r.max_score }}</td>
              <td>{{ r.submitted_at ? new Date(r.submitted_at).toLocaleDateString() : '-' }}</td>
              <td>
                <button class="btn-sm" @click="giveFeedback(r)">Feedback</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="feedbackTarget" style="margin-top: 0.5rem">
          <textarea v-model="feedbackText" placeholder="Enter feedback" rows="3"></textarea>
          <button class="btn-primary btn-sm" @click="submitFeedback">Submit Feedback</button>
        </div>
      </div>
    </template>

    <template v-if="tab === 'analytics'">
      <div class="grid grid-3">
        <div v-if="learningStore.analytics" class="card">
          <h4>Classes</h4>
          <p style="font-size: 2rem; font-weight: 700">
            {{ learningStore.analytics.totalClasses }}
          </p>
        </div>
        <div v-if="learningStore.analytics" class="card">
          <h4>Assignments</h4>
          <p style="font-size: 2rem; font-weight: 700">
            {{ learningStore.analytics.totalAssignments }}
          </p>
        </div>
        <div v-if="learningStore.analytics" class="card">
          <h4>Avg Score</h4>
          <p style="font-size: 2rem; font-weight: 700">
            {{ learningStore.analytics.averageScore }}%
          </p>
        </div>
      </div>

      <div class="grid grid-2" style="margin-top: 1rem">
        <div class="card">
          <h4>🚨 Needs Intervention</h4>
          <p style="color: var(--text-muted); font-size: 0.85rem">
            Dynamic suggestions based on recent failures and low mastery.
          </p>
          <div v-if="learningStore.interventions.length === 0" style="color: var(--text-muted)">
            No critical interventions needed.
          </div>
          <div
            v-for="(inv, i) in learningStore.interventions"
            :key="i"
            style="padding: 0.5rem 0; border-bottom: 1px solid var(--border-color)"
          >
            <strong>{{ inv.type }}</strong>
            <p style="font-size: 0.9rem; margin-top: 0.25rem">{{ inv.description }}</p>
          </div>
        </div>

        <div class="card">
          <h4>🧠 Class Mastery Map</h4>
          <p style="color: var(--text-muted); font-size: 0.85rem">
            Weakest concepts across all your classes.
          </p>
          <div
            v-if="learningStore.masteryMap && learningStore.masteryMap.length === 0"
            style="color: var(--text-muted)"
          >
            No mastery data yet.
          </div>
          <div
            v-for="m in learningStore.masteryMap?.slice(0, 5)"
            :key="m.topic"
            style="display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0"
          >
            <span style="flex: 1">{{ m.topic }}</span>
            <div
              style="
                width: 100px;
                height: 8px;
                background: var(--border-color);
                border-radius: 4px;
                overflow: hidden;
              "
            >
              <div
                :style="{
                  width: m.averageMastery + '%',
                  background: m.averageMastery < 50 ? 'var(--danger)' : 'var(--primary)',
                  height: '100%',
                }"
              ></div>
            </div>
            <span style="font-size: 0.8rem">{{ m.averageMastery }}%</span>
          </div>
        </div>
      </div>
    </template>

    <template v-if="tab === 'courses'">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem">
        <h3>My Courses</h3>
        <button class="btn-primary" @click="openCreateCourseModal">Create Course</button>
      </div>

      <div v-if="coursesStore.courses.length === 0" style="color: var(--text-muted); text-align: center; padding: 3rem 1rem;" class="card">
        No courses created yet. Create a course to sequence learning modules with score thresholds and badges!
      </div>

      <div v-else class="grid grid-2">
        <div v-for="course in coursesStore.courses" :key="course.id" class="card" style="display: flex; flex-direction: column; justify-content: space-between; border-top: 4px solid var(--primary); min-height: 200px;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; gap: 0.5rem;">
              <h4 style="margin: 0; font-size: 1.25rem;">{{ course.name }}</h4>
              <span v-if="course.badge_name" class="badge" style="background: rgba(234, 179, 8, 0.15); color: #ca8a04; border: 1px solid rgba(234, 179, 8, 0.3); font-weight: 700; font-size: 0.8rem; white-space: nowrap;">
                🏆 {{ course.badge_name }}
              </span>
            </div>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem; line-height: 1.4;">
              {{ course.description || 'No description provided.' }}
            </p>

            <div style="font-size: 0.8rem; color: var(--text-muted); display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem;">
              <span v-if="course.deadline">📅 Deadline: <strong>{{ new Date(course.deadline).toLocaleDateString() }}</strong></span>
              <span>🎯 Pass Threshold: <strong>{{ course.unlock_threshold }}%</strong></span>
            </div>
          </div>

          <div style="display: flex; gap: 0.5rem; margin-top: auto; border-top: 1px solid var(--border-color); padding-top: 0.75rem;">
            <button class="btn-sm" @click="manageCourse(course)">Manage & Edit</button>
            <button class="btn-sm btn-danger" @click="deleteCourse(course.id)">Delete</button>
          </div>
        </div>
      </div>
    </template>
  </div>

  <!-- Create Course Modal -->
  <div v-if="createCourseModalOpen" class="modal-overlay" @click.self="closeCreateCourseModal">
    <div class="modal" style="max-width: 500px;">
      <h3 style="margin-top: 0; margin-bottom: 1.25rem; font-weight: 700;">Create New Course</h3>
      <div class="form-group" style="margin-bottom: 1rem;">
        <label style="display: block; font-weight: 600; margin-bottom: 0.25rem; font-size: 0.9rem;">Course Name *</label>
        <input v-model="courseForm.name" placeholder="e.g., Algebra I, Physics Basics" style="width: 100%;" required />
      </div>
      <div class="form-group" style="margin-bottom: 1rem;">
        <label style="display: block; font-weight: 600; margin-bottom: 0.25rem; font-size: 0.9rem;">Description</label>
        <textarea v-model="courseForm.description" placeholder="A brief description of this course..." style="width: 100%; resize: vertical;" rows="3"></textarea>
      </div>
      <div class="grid grid-2" style="margin-bottom: 1rem; gap: 1rem;">
        <div class="form-group">
          <label style="display: block; font-weight: 600; margin-bottom: 0.25rem; font-size: 0.9rem;">Unlock Threshold (%)</label>
          <input v-model.number="courseForm.unlock_threshold" type="number" min="0" max="100" style="width: 100%;" />
        </div>
        <div class="form-group">
          <label style="display: block; font-weight: 600; margin-bottom: 0.25rem; font-size: 0.9rem;">Course Deadline</label>
          <input v-model="courseForm.deadline" type="date" style="width: 100%;" />
        </div>
      </div>
      <div class="form-group" style="margin-bottom: 1.5rem;">
        <label style="display: block; font-weight: 600; margin-bottom: 0.25rem; font-size: 0.9rem;">Completion Badge Name</label>
        <input v-model="courseForm.badge_name" placeholder="e.g., Math Wizard, Physics Pioneer" style="width: 100%;" />
        <span style="font-size: 0.75rem; color: var(--text-muted); display: block; margin-top: 0.25rem;">
          Students will receive this badge on their profile + 100 XP upon completion.
        </span>
      </div>
      <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
        <button class="btn-sm" @click="closeCreateCourseModal">Cancel</button>
        <button class="btn-primary btn-sm" @click="doCreateCourse">Create Course</button>
      </div>
    </div>
  </div>

  <!-- Manage Course Modal -->
  <div v-if="manageCourseModalOpen" class="modal-overlay" @click.self="manageCourseModalOpen = false">
    <div class="modal" style="max-width: 900px; width: 95%; max-height: 90vh; overflow-y: auto; display: flex; flex-direction: column; gap: 1.5rem; padding: 2rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem;">
        <h3 style="margin: 0; font-size: 1.4rem; font-weight: 700;">Manage Course: {{ coursesStore.currentCourse?.course?.name }}</h3>
        <button class="btn-sm" @click="manageCourseModalOpen = false" style="background: transparent; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted);">&times;</button>
      </div>

      <div class="grid grid-3" style="align-items: start; gap: 1.5rem;">
        <!-- Left Column: Course Settings Form -->
        <div class="card" style="padding: 1.25rem; grid-column: span 1; background: var(--bg-main);">
          <h4 style="margin-top: 0; margin-bottom: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; color: var(--primary); font-weight: 700;">Course Settings</h4>
          <div class="form-group" style="margin-bottom: 1rem;">
            <label style="display: block; font-weight: 600; margin-bottom: 0.25rem; font-size: 0.85rem;">Name *</label>
            <input v-model="courseForm.name" style="width: 100%;" />
          </div>
          <div class="form-group" style="margin-bottom: 1rem;">
            <label style="display: block; font-weight: 600; margin-bottom: 0.25rem; font-size: 0.85rem;">Description</label>
            <textarea v-model="courseForm.description" style="width: 100%; resize: vertical;" rows="3"></textarea>
          </div>
          <div class="form-group" style="margin-bottom: 1rem;">
            <label style="display: block; font-weight: 600; margin-bottom: 0.25rem; font-size: 0.85rem;">Default Threshold (%)</label>
            <input v-model.number="courseForm.unlock_threshold" type="number" min="0" max="100" style="width: 100%;" />
          </div>
          <div class="form-group" style="margin-bottom: 1rem;">
            <label style="display: block; font-weight: 600; margin-bottom: 0.25rem; font-size: 0.85rem;">Deadline</label>
            <input v-model="courseForm.deadline" type="date" style="width: 100%;" />
          </div>
          <div class="form-group" style="margin-bottom: 1.25rem;">
            <label style="display: block; font-weight: 600; margin-bottom: 0.25rem; font-size: 0.85rem;">Completion Badge Name</label>
            <input v-model="courseForm.badge_name" style="width: 100%;" />
          </div>
          <button class="btn-primary" style="width: 100%; font-weight: 600;" @click="saveCourseSettings">Save Settings</button>
        </div>

        <!-- Middle Column: Worksheets Sequencing -->
        <div class="card" style="padding: 1.25rem; grid-column: span 2; background: var(--bg-main);">
          <h4 style="margin-top: 0; margin-bottom: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; color: var(--primary); display: flex; justify-content: space-between; align-items: center; font-weight: 700;">
            <span>Worksheet Sequence</span>
            <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: normal;">
              {{ coursesStore.currentCourse?.worksheets?.length || 0 }} modules
            </span>
          </h4>

          <!-- Add Worksheet form -->
          <div style="display: flex; gap: 0.5rem; margin-bottom: 1.25rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-color);">
            <select v-model="newWorksheetToCourseId" style="flex: 1;">
              <option value="">Select worksheet to add...</option>
              <option v-for="ws in availableWorksheetsForCourse" :key="ws.id" :value="ws.id">
                {{ ws.title }} ({{ ws.subject || 'General' }})
              </option>
            </select>
            <button class="btn-primary btn-sm" @click="addWorksheetToCourse" :disabled="!newWorksheetToCourseId">Add</button>
          </div>

          <!-- List of worksheets -->
          <div v-if="!coursesStore.currentCourse?.worksheets?.length" style="color: var(--text-muted); text-align: center; padding: 3rem 0;">
            No worksheets added to this course yet.
          </div>
          
          <div v-else style="display: flex; flex-direction: column; gap: 0.75rem; max-height: 400px; overflow-y: auto; padding-right: 0.25rem;">
            <div v-for="(ws, index) in coursesStore.currentCourse.worksheets" :key="ws.id" 
              style="padding: 0.75rem; border: 1px solid var(--border-color); border-radius: var(--radius-sm); background: var(--bg-card); display: flex; flex-direction: column; gap: 0.5rem; transition: border-color 0.2s;"
              :style="{ borderColor: editingCourseWorksheetSettings === ws.id ? 'var(--primary)' : 'var(--border-color)' }"
            >
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <span style="font-weight: bold; color: var(--text-muted); font-size: 0.9rem;">#{{ index + 1 }}</span>
                  <strong style="font-size: 0.95rem;">{{ ws.title }}</strong>
                  <span style="color: var(--text-muted); font-size: 0.75rem;">({{ ws.subject || 'General' }})</span>
                </div>
                
                <div style="display: flex; gap: 0.25rem;">
                  <button class="btn-sm" style="padding: 0.2rem 0.5rem; font-size: 0.75rem; font-weight: 500;" @click="editingCourseWorksheetSettings = editingCourseWorksheetSettings === ws.id ? null : ws.id">
                    ⚙️ {{ editingCourseWorksheetSettings === ws.id ? 'Close' : 'Configure' }}
                  </button>
                  <button class="btn-sm" style="padding: 0.2rem 0.4rem;" @click="moveWorksheet(ws.id, -1)" :disabled="index === 0">▲</button>
                  <button class="btn-sm" style="padding: 0.2rem 0.4rem;" @click="moveWorksheet(ws.id, 1)" :disabled="index === coursesStore.currentCourse.worksheets.length - 1">▼</button>
                  <button class="btn-sm btn-danger" style="padding: 0.2rem 0.4rem;" @click="removeWorksheetFromCourse(ws.id)">&times;</button>
                </div>
              </div>

              <!-- Worksheet Settings Panel (Expandable) -->
              <div v-if="editingCourseWorksheetSettings === ws.id" style="margin-top: 0.25rem; padding: 0.75rem; background: var(--bg-main); border-radius: var(--radius-xs); border: 1px dashed var(--border-color);">
                <h5 style="margin-top: 0; margin-bottom: 0.5rem; font-size: 0.85rem; color: var(--primary); font-weight: 700;">Configure Worksheet Settings</h5>
                <div class="grid grid-2" style="gap: 0.75rem; align-items: end;">
                  <div class="form-group">
                    <label style="display: block; font-size: 0.75rem; font-weight: 600; margin-bottom: 0.15rem;">Unlock Threshold (%)</label>
                    <input v-model.number="ws.ws_unlock_threshold" type="number" min="0" max="100" placeholder="Inherited (default)" style="width: 100%; padding: 0.25rem 0.5rem; font-size: 0.85rem;" />
                  </div>
                  <div class="form-group">
                    <label style="display: block; font-size: 0.75rem; font-weight: 600; margin-bottom: 0.15rem;">Deadline override</label>
                    <input v-model="ws.ws_deadline" type="date" style="width: 100%; padding: 0.25rem 0.5rem; font-size: 0.85rem;" />
                  </div>
                  <div style="grid-column: span 2; display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.5rem;">
                    <button class="btn-sm" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" @click="editingCourseWorksheetSettings = null">Cancel</button>
                    <button class="btn-primary btn-sm" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" @click="updateWorksheetOverride(ws)">Save Settings</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Row: Student Enrollment management -->
      <div class="card" style="padding: 1.25rem; margin-top: 0.5rem; background: var(--bg-main);">
        <h4 style="margin-top: 0; margin-bottom: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; color: var(--primary); display: flex; justify-content: space-between; align-items: center; font-weight: 700;">
          <span>Student Enrollment</span>
          <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: normal;">
            {{ coursesStore.currentCourse?.students?.length || 0 }} students enrolled
          </span>
        </h4>

        <!-- Enroll Form -->
        <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem; max-width: 500px;">
          <select v-model="newStudentToCourseId" style="flex: 1;">
            <option value="">Select student to enroll...</option>
            <option v-for="st in availableStudentsForCourse" :key="st.id" :value="st.id">
              {{ st.name }} (@{{ st.username }})
            </option>
          </select>
          <button class="btn-primary btn-sm" @click="enrollStudentInCourse" :disabled="!newStudentToCourseId">Enroll Student</button>
        </div>

        <div v-if="!coursesStore.currentCourse?.students?.length" style="color: var(--text-muted); text-align: center; padding: 1.5rem 0;">
          No students currently enrolled in this course.
        </div>

        <div v-else style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 0.75rem; max-height: 200px; overflow-y: auto;">
          <div v-for="st in coursesStore.currentCourse.students" :key="st.id" 
            style="padding: 0.5rem 0.75rem; border: 1px solid var(--border-color); border-radius: var(--radius-sm); background: var(--bg-card); display: flex; justify-content: space-between; align-items: center;"
          >
            <div style="display: flex; align-items: center; gap: 0.5rem; min-width: 0;">
              <span style="font-size: 1.25rem;">{{ st.character_emoji || '👤' }}</span>
              <div style="min-width: 0;">
                <div style="font-weight: 600; font-size: 0.85rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ st.name }}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">@{{ st.username }}</div>
              </div>
            </div>
            <button class="btn-sm btn-danger" style="padding: 0.15rem 0.4rem; font-size: 0.75rem;" @click="unenrollStudentFromCourse(st.id)">Unenroll</button>
          </div>
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; border-top: 1px solid var(--border-color); padding-top: 0.75rem;">
        <button class="btn-primary btn-sm" @click="manageCourseModalOpen = false">Done</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useWorksheetsStore } from '../stores/worksheets'
import { useClassesStore } from '../stores/classes'
import { useSubmissionsStore } from '../stores/submissions'
import { useLearningStore } from '../stores/learning'
import { useUiStore } from '../stores/ui'
import { useCoursesStore } from '../stores/courses'
import { api } from '../services/api'

const router = useRouter()
const wsStore = useWorksheetsStore()
const classesStore = useClassesStore()
const submissionsStore = useSubmissionsStore()
const learningStore = useLearningStore()
const uiStore = useUiStore()
const coursesStore = useCoursesStore()

const tab = ref('worksheets')
const classesList = ref([])
const newClassName = ref('')
const assignTarget = ref(null)
const assignForm = ref({ class_id: '', class_name: '', due_date: '', retry_policy: 'single' })
const selectedClass = ref(null)
const classProgress = ref([])
const selectedAssignment = ref(null)
const results = ref([])
const feedbackTarget = ref(null)
const feedbackText = ref('')

const createCourseModalOpen = ref(false)
const manageCourseModalOpen = ref(false)
const courseForm = ref({ name: '', description: '', unlock_threshold: 60, deadline: '', badge_name: '' })
const selectedCourseId = ref(null)
const newWorksheetToCourseId = ref('')
const newStudentToCourseId = ref('')
const editingCourseWorksheetSettings = ref(null)
const allStudents = ref([])

const searchQuery = ref('')
const filteredWorksheets = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return wsStore.worksheets
  return wsStore.worksheets.filter((ws) => {
    return (
      ws.title.toLowerCase().includes(q) ||
      (ws.subject && ws.subject.toLowerCase().includes(q)) ||
      (ws.grade_level && ws.grade_level.toLowerCase().includes(q))
    )
  })
})

const availableWorksheetsForCourse = computed(() => {
  if (!coursesStore.currentCourse?.worksheets) return wsStore.worksheets
  const currentIds = new Set(coursesStore.currentCourse.worksheets.map((w) => w.id))
  return wsStore.worksheets.filter((w) => !currentIds.has(w.id))
})

const availableStudentsForCourse = computed(() => {
  if (!coursesStore.currentCourse?.students) return allStudents.value
  const enrolledIds = new Set(coursesStore.currentCourse.students.map((s) => s.id))
  return allStudents.value.filter((s) => !enrolledIds.has(s.id))
})

onMounted(async () => {
  await wsStore.fetchMyWorksheets()
  await classesStore.fetchClasses()
  classesList.value = classesStore.classes
  await learningStore.fetchTeacherDashboard()
  try {
    await coursesStore.fetchCourses()
  } catch {
    /* ignore */
  }
})

function editWs(id) {
  router.push(`/teacher/builder/${id}`)
}
function previewWs(id) {
  router.push(`/teacher/preview/${id}`)
}

async function duplicateWs(id) {
  try {
    await wsStore.duplicateWorksheet(id)
    await wsStore.fetchMyWorksheets()
    uiStore.showToast('Worksheet duplicated', 'success')
  } catch (e) {
    uiStore.showToast(e.message, 'error')
  }
}

async function deleteWs(id) {
  try {
    await wsStore.deleteWorksheet(id)
    await wsStore.fetchMyWorksheets()
    uiStore.showToast('Worksheet deleted', 'success')
  } catch (e) {
    uiStore.showToast(e.message, 'error')
  }
}

function assignWs(ws) {
  assignTarget.value = ws
  assignForm.value = { class_id: '', class_name: '', due_date: '', retry_policy: 'single' }
}

async function doAssign(wsId) {
  if (!assignForm.value.class_id) {
    uiStore.showToast('Please select a class', 'error')
    return
  }
  try {
    const selectedClassObj = classesList.value.find((c) => c.id === assignForm.value.class_id)
    if (selectedClassObj) {
      assignForm.value.class_name = selectedClassObj.name
    }
    await wsStore.createAssignment(wsId, assignForm.value)
    uiStore.showToast('Assignment created', 'success')
    assignTarget.value = null
  } catch (e) {
    uiStore.showToast(e.message, 'error')
  }
}

async function createClass() {
  if (!newClassName.value.trim()) return
  try {
    await classesStore.createClass({ name: newClassName.value })
    uiStore.showToast('Class created', 'success')
    newClassName.value = ''
    await classesStore.fetchClasses()
    classesList.value = classesStore.classes
  } catch (e) {
    uiStore.showToast(e.message, 'error')
  }
}

async function deleteClass(id) {
  try {
    await classesStore.deleteClass(id)
    await classesStore.fetchClasses()
    classesList.value = classesStore.classes
  } catch (e) {
    uiStore.showToast(e.message, 'error')
  }
}

async function viewClassProgress(id) {
  if (selectedClass.value === id) {
    selectedClass.value = null
    classProgress.value = []
    return
  }
  selectedClass.value = id
  try {
    const data = await classesStore.fetchClassProgress(id)
    classProgress.value = data.progress
  } catch {
    /* */
  }
}

async function exportCsv(id) {
  try {
    await classesStore.exportCsv(id)
    uiStore.showToast('CSV downloaded', 'success')
  } catch {
    /* */
  }
}

function giveFeedback(r) {
  feedbackTarget.value = r
  feedbackText.value = r.feedback || ''
}

async function submitFeedback() {
  if (!feedbackTarget.value) return
  try {
    await submissionsStore.submitFeedback(feedbackTarget.value.id, feedbackText.value)
    uiStore.showToast('Feedback saved', 'success')
    feedbackTarget.value = null
  } catch (e) {
    uiStore.showToast(e.message, 'error')
  }
}

function openCreateCourseModal() {
  courseForm.value = { name: '', description: '', unlock_threshold: 60, deadline: '', badge_name: '' }
  createCourseModalOpen.value = true
}

function closeCreateCourseModal() {
  createCourseModalOpen.value = false
}

async function doCreateCourse() {
  if (!courseForm.value.name.trim()) return
  try {
    await coursesStore.createCourse(courseForm.value)
    uiStore.showToast('Course created successfully', 'success')
    createCourseModalOpen.value = false
    await coursesStore.fetchCourses()
  } catch (e) {
    uiStore.showToast(e.message || 'Error creating course', 'error')
  }
}

async function manageCourse(course) {
  selectedCourseId.value = course.id
  courseForm.value = {
    name: course.name || '',
    description: course.description || '',
    unlock_threshold: course.unlock_threshold !== undefined ? course.unlock_threshold : 60,
    deadline: course.deadline || '',
    badge_name: course.badge_name || '',
  }
  editingCourseWorksheetSettings.value = null
  newWorksheetToCourseId.value = ''
  newStudentToCourseId.value = ''
  
  try {
    await coursesStore.fetchCourse(course.id)
    manageCourseModalOpen.value = true
    await loadAllStudents()
  } catch {
    uiStore.showToast('Error loading course details', 'error')
  }
}

async function saveCourseSettings() {
  try {
    await coursesStore.updateCourseSettings(selectedCourseId.value, courseForm.value)
    uiStore.showToast('Course settings updated', 'success')
    await coursesStore.fetchCourses()
  } catch (e) {
    uiStore.showToast(e.message || 'Error updating settings', 'error')
  }
}

async function deleteCourse(id) {
  if (!confirm('Are you sure you want to delete this course?')) return
  try {
    await coursesStore.deleteCourse(id)
    uiStore.showToast('Course deleted', 'success')
    await coursesStore.fetchCourses()
  } catch (e) {
    uiStore.showToast(e.message || 'Error deleting course', 'error')
  }
}

async function addWorksheetToCourse() {
  if (!newWorksheetToCourseId.value) return
  try {
    await coursesStore.addWorksheetToCourse(selectedCourseId.value, newWorksheetToCourseId.value)
    uiStore.showToast('Worksheet added to course', 'success')
    newWorksheetToCourseId.value = ''
    await coursesStore.fetchCourse(selectedCourseId.value)
  } catch (e) {
    uiStore.showToast(e.message || 'Error adding worksheet', 'error')
  }
}

async function removeWorksheetFromCourse(worksheetId) {
  try {
    await coursesStore.removeWorksheetFromCourse(selectedCourseId.value, worksheetId)
    uiStore.showToast('Worksheet removed from course', 'success')
    if (editingCourseWorksheetSettings.value === worksheetId) {
      editingCourseWorksheetSettings.value = null
    }
    await coursesStore.fetchCourse(selectedCourseId.value)
  } catch (e) {
    uiStore.showToast(e.message || 'Error removing worksheet', 'error')
  }
}

async function moveWorksheet(worksheetId, direction) {
  const wsList = coursesStore.currentCourse?.worksheets
  if (!wsList) return
  const idx = wsList.findIndex((w) => w.id === worksheetId)
  if (idx === -1) return
  const targetIdx = idx + direction
  if (targetIdx < 0 || targetIdx >= wsList.length) return
  
  const listCopy = [...wsList]
  const temp = listCopy[idx]
  listCopy[idx] = listCopy[targetIdx]
  listCopy[targetIdx] = temp
  
  const orderedIds = listCopy.map((w) => w.id)
  try {
    await coursesStore.reorderWorksheets(selectedCourseId.value, orderedIds)
    await coursesStore.fetchCourse(selectedCourseId.value)
  } catch {
    uiStore.showToast('Error reordering worksheets', 'error')
  }
}

async function updateWorksheetOverride(ws) {
  try {
    await coursesStore.updateCourseWorksheetSettings(selectedCourseId.value, ws.id, {
      unlock_threshold: ws.ws_unlock_threshold !== null && ws.ws_unlock_threshold !== '' ? Number(ws.ws_unlock_threshold) : null,
      deadline: ws.ws_deadline || null,
    })
    uiStore.showToast('Worksheet settings updated', 'success')
    editingCourseWorksheetSettings.value = null
    await coursesStore.fetchCourse(selectedCourseId.value)
  } catch {
    uiStore.showToast('Error updating worksheet settings', 'error')
  }
}

async function loadAllStudents() {
  const studentsMap = new Map()
  for (const c of classesList.value) {
    try {
      const data = await api.get(`/classes/${c.id}/students`)
      if (data && data.students) {
        data.students.forEach((s) => {
          studentsMap.set(s.id, s)
        })
      }
    } catch {
      /* ignore */
    }
  }
  allStudents.value = Array.from(studentsMap.values())
}

async function enrollStudentInCourse() {
  if (!newStudentToCourseId.value) return
  try {
    await coursesStore.enrollStudent(selectedCourseId.value, newStudentToCourseId.value)
    uiStore.showToast('Student enrolled', 'success')
    newStudentToCourseId.value = ''
    await coursesStore.fetchCourse(selectedCourseId.value)
  } catch (e) {
    uiStore.showToast(e.message || 'Error enrolling student', 'error')
  }
}

async function unenrollStudentFromCourse(studentId) {
  try {
    await coursesStore.unenrollStudent(selectedCourseId.value, studentId)
    uiStore.showToast('Student unenrolled', 'success')
    await coursesStore.fetchCourse(selectedCourseId.value)
  } catch (e) {
    uiStore.showToast(e.message || 'Error unenrolling student', 'error')
  }
}
</script>

<style scoped>
.student-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.student-progress-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1rem;
  transition: all 0.3s ease;
  position: relative;
}

.student-progress-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.student-progress-card.at-risk {
  border-color: rgba(239, 68, 68, 0.4);
  background: linear-gradient(to bottom, var(--bg-card), rgba(239, 68, 68, 0.02));
  animation: pulse-border 2s infinite alternate;
}

@keyframes pulse-border {
  0% {
    box-shadow: 0 0 4px rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.3);
  }
  100% {
    box-shadow: 0 0 12px rgba(239, 68, 68, 0.3);
    border-color: rgba(239, 68, 68, 0.7);
  }
}

.student-emoji {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  background: var(--bg-main);
  border: 1px solid var(--border-color);
  border-radius: 50%;
}

.status-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  border-radius: 20px;
}

.risk-badge {
  background: rgba(239, 68, 68, 0.15);
  color: var(--danger);
}

.complete-badge {
  background: rgba(34, 197, 94, 0.15);
  color: var(--success);
}

.track-badge {
  background: rgba(79, 70, 229, 0.15);
  color: var(--primary);
}

.progress-bar-container {
  width: 100%;
  height: 8px;
  background: var(--border-color);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  transition: width 0.5s ease;
}
</style>
