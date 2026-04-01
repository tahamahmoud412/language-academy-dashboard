import { Component, inject, signal, Output, EventEmitter, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { ExamService } from '../../../core/services/exam.service';
import { ExamCreatePayload, ExamSection, QuestionDetail } from '../../../core/models/exam-create.model';
import { ExamType } from '../../../core/models/exams.model';
import { ExamInfoStepComponent } from './components/exam-info-step/exam-info-step.component';
import { SectionQuestionsStepComponent } from './components/section-questions-step/section-questions-step.component';
import { ReviewStepComponent } from './components/review-step/review-step.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-exam-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ExamInfoStepComponent,
    SectionQuestionsStepComponent,
    ReviewStepComponent
  ],
  templateUrl: './exam-create.component.html',
  styleUrl: './exam-create.component.css'
})
export class ExamCreateComponent implements OnInit {
  public fb = inject(FormBuilder);
  public examService = inject(ExamService);
  public router = inject(Router);
  
  @Output() close = new EventEmitter<boolean>();
  @Input() editExamId: number | null = null;

  loadingExam = signal<boolean>(false);
  currentStep = signal<number>(0);
  examTypes = signal<ExamType[]>([]);

  ngOnInit(): void {
    this.fetchExamTypes();
    if (this.editExamId) {
      this.loadExamData(this.editExamId);
    }
  }

  loadExamData(id: number) {
    this.loadingExam.set(true);
    this.examService.getExamById(id).subscribe({
      next: (res) => {
        const exam = res.data?.exam || res.data || res;
        this.examForm.get('info')?.patchValue({
          name: exam.name,
          description: exam.description,
          exam_type_id: (exam.exam_type_id || exam.exam_type?.id) ? Number(exam.exam_type_id || exam.exam_type?.id) : null,
          exam_date: exam.exam_date,
          exam_time: exam.exam_time,
          duration_minutes: exam.duration_minutes,
          price: typeof exam.price === 'object' ? exam.price?.value : exam.price,
          max_students: exam.max_students,
          registration_deadline: exam.registration_deadline
        });

        let returnedSections = exam.questions || exam.sections || [];
        if (typeof returnedSections === 'string') {
            try { returnedSections = JSON.parse(returnedSections); } catch(e) { returnedSections = []; }
        }

        if (Array.isArray(returnedSections) && returnedSections.length > 0) {
           this.sections.clear();
           
           returnedSections.forEach((sec: any) => {
              const secGroup = this.createSectionGroup(sec.section_type);
              secGroup.patchValue({
                 time_minutes: sec.time_minutes,
                 passage: sec.passage || ''
              });

              if (sec.section_type === 'listening') {
                 secGroup.get('audio_file')?.clearValidators();
                 secGroup.get('audio_file')?.updateValueAndValidity();
              }
              
              let secQuestions = sec.questions;
              if (typeof secQuestions === 'string') {
                  try { secQuestions = JSON.parse(secQuestions); } catch(e) { secQuestions = []; }
              }

              if (secQuestions && Array.isArray(secQuestions)) {
                 const questionsArray = secGroup.get('questions') as FormArray;
                 secQuestions.forEach((q: any) => {
                    let qOptions = q.options;
                    if (typeof qOptions === 'string') {
                        try { qOptions = JSON.parse(qOptions); } catch(e) { qOptions = {}; }
                    }

                    const qGroup = this.fb.group({
                      question_id: [q.question_id || q.id],
                      question_text: [q.question_text, Validators.required],
                      options: this.fb.group({
                        A: [qOptions?.A || '', Validators.required],
                        B: [qOptions?.B || '', Validators.required],
                        C: [qOptions?.C || '', Validators.required],
                        D: [qOptions?.D || '', Validators.required]
                      }),
                      correct_answer: [q.correct_answer, Validators.required],
                      points: [q.points || 1, [Validators.required, Validators.min(0.5)]]
                    });
                    questionsArray.push(qGroup);
                 });
              }
              this.sections.push(secGroup);
           });
           
           const existingTypes = returnedSections.map((s:any) => s.section_type);
           ['reading', 'listening', 'grammar'].forEach(t => {
              if (!existingTypes.includes(t)) {
                 this.sections.push(this.createSectionGroup(t));
              }
           });
        }

        // Fetch Exam Audio
        this.examService.getExamAudio(id).subscribe({
           next: (audioRes) => {
              if (audioRes && audioRes.data) {
                 const audios = Array.isArray(audioRes.data) ? audioRes.data : [audioRes.data];
                 if (audios.length > 0) {
                    const listeningSection = this.sections.controls.find(s => s.get('section_type')?.value === 'listening');
                    if (listeningSection) {
                       listeningSection.patchValue({ existing_audio: audios[0] });
                       listeningSection.get('audio_file')?.clearValidators();
                       listeningSection.get('audio_file')?.updateValueAndValidity();
                    }
                 }
              }
           },
           error: (err) => console.error('Error fetching audio', err)
        });

        this.loadingExam.set(false);
      },
      error: (err) => {
        console.error('Error fetching exam', err);
        Swal.fire('خطأ', 'فشل تحميل بيانات الاختبار', 'error');
        this.loadingExam.set(false);
      }
    });
  }

  fetchExamTypes(): void {
    this.examService.getExamTypes().subscribe({
      next: (response) => {
        if (response.success) {
          this.examTypes.set(response.data);
        }
      },
      error: (err) => {
        console.error('Error fetching exam types:', err);
      }
    });
  }

  steps = [
    { label: 'المعلومات', icon: 'pi pi-info-circle' },
    { label: 'القراءة', icon: 'pi pi-book' },
    { label: 'الاستماع', icon: 'pi pi-volume-up' },
    { label: 'القواعد', icon: 'pi pi-pencil' },
    { label: 'التأكيد', icon: 'pi pi-check-circle' }
  ];

  examForm: FormGroup = this.fb.group({
    info: this.fb.group({
      name: ['', Validators.required],
      description: [''],
      exam_type_id: [null, Validators.required],
      exam_date: ['', [Validators.required, this.futureDateValidator()]],
      exam_time: ['', Validators.required],
      duration_minutes: [null, [Validators.required, Validators.min(1)]],
      price: [null, [Validators.required, Validators.min(0)]],
      max_students: [null, [Validators.required, Validators.min(1)]],
      registration_deadline: ['', [Validators.required, this.futureDateValidator()]]
    }, { validators: this.deadlineBeforeExamValidator }),
    sections: this.fb.array([
      this.createSectionGroup('reading'),
      this.createSectionGroup('listening'),
      this.createSectionGroup('grammar')
    ])
  });

  private futureDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const inputDate = new Date(control.value);
      inputDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return inputDate < today ? { pastDate: true } : null;
    };
  }

  private deadlineBeforeExamValidator(group: AbstractControl): ValidationErrors | null {
    const examDate = group.get('exam_date')?.value;
    const deadline = group.get('registration_deadline')?.value;
    if (examDate && deadline) {
      return new Date(deadline) > new Date(examDate) ? { deadlineAfterExam: true } : null;
    }
    return null;
  }

  sectionTypeNames: Record<string, string> = {
    'reading': 'القراءة',
    'listening': 'الاستماع',
    'grammar': 'القواعد'
  };

  get sections() {
    return this.examForm.get('sections') as FormArray;
  }

  asFormGroup(control: any): FormGroup {
    return control as FormGroup;
  }

  private createSectionGroup(type: string): FormGroup {
    return this.fb.group({
      section_type: [type],
      time_minutes: [30, [Validators.required, Validators.min(1)]],
      passage: ['', type === 'reading' ? [Validators.required] : []],
      audio_file: [null, type === 'listening' ? [Validators.required] : []],
      existing_audio: [null],
      questions: this.fb.array([])
    });
  }

  nextStep() {
    if (this.isStepValid()) {
      this.currentStep.update(s => s + 1);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'خطأ',
        text: 'يرجى إكمال جميع الحقول المطلوبة بشكل صحيح قبل الانتقال للخطوة التالية',
        confirmButtonText: 'حسناً'
      });
    }
  }

  prevStep() {
    this.currentStep.update(s => s - 1);
  }

  onDeleteExistingAudio(audioId: number) {
    if (!this.editExamId) return;

    Swal.fire({
      title: 'هل أنت متأكد؟',
      text: 'سيتم حذف الملف الصوتي نهائياً فوراً',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'نعم، احذف',
      cancelButtonText: 'إلغاء'
    }).then(result => {
      if (result.isConfirmed) {
        Swal.fire({ title: 'جاري الحذف...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        this.examService.deleteExamAudio(this.editExamId!, audioId).subscribe({
          next: () => {
            Swal.fire('تم الحذف', 'تم حذف الملف الصوتي بنجاح', 'success');
            const listeningSection = this.sections.controls.find(s => s.get('section_type')?.value === 'listening');
            if (listeningSection) {
              listeningSection.patchValue({ existing_audio: null });
              listeningSection.get('audio_file')?.setValidators([Validators.required]);
              listeningSection.get('audio_file')?.updateValueAndValidity();
            }
          },
          error: (err) => {
            console.error('Failed to delete audio:', err);
            Swal.fire('خطأ', 'فشل حذف الملف الصوتي', 'error');
          }
        });
      }
    });
  }

  isStepValid(): boolean {
    const step = this.currentStep();
    if (step === 0) {
      const infoGroup = this.examForm.get('info') as FormGroup;
      if (infoGroup.invalid) {
        infoGroup.markAllAsTouched();
        return false;
      }
      return true;
    } else if (step >= 1 && step <= 3) {
      const section = this.sections.at(step - 1) as FormGroup;
      const questionsCount = (section.get('questions') as FormArray).length;
      
      if (section.invalid) {
        section.markAllAsTouched();
        return false;
      }

      return true;
    }
    return true;
  }

  onSubmit() {
    if (this.examForm.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'خطأ في النموذج',
        text: 'يرجى مراجعة الخطوات السابقة والتأكد من صحة جميع البيانات',
        confirmButtonText: 'حسناً'
      });
      return;
    }

    const formValue = this.examForm.value;
    
    // The API expects an array of sections (not a flat array) under the 'questions' key.
    // Filter out sections that have no questions added.
    const validSections = formValue.sections.filter((section: any) => section.questions && section.questions.length > 0);

    if (validSections.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'لا يوجد أسئلة',
        text: 'يجب إضافة سؤال واحد على الأقل في أي من الأقسام قبل حفظ الاختبار',
        confirmButtonText: 'حسناً'
      });
      return;
    }

    // Format the sections to match API requirements
    let questionIndex = 1;
    const formattedSections = validSections.map((section: any) => {
      const formattedQ = section.questions.map((q: any) => ({
        question_id: questionIndex++,
        question_text: q.question_text,
        options: q.options,
        correct_answer: q.correct_answer,
        points: q.points
      }));

      const sectionPayload: any = {
        section_type: section.section_type,
        time_minutes: section.time_minutes,
        questions: formattedQ
      };

      if (section.section_type === 'reading' && section.passage) {
        sectionPayload.passage = section.passage;
      }

      return sectionPayload;
    });

    const payload: ExamCreatePayload = {
      name: formValue.info.name,
      description: formValue.info.description || '',
      exam_type_id: formValue.info.exam_type_id,
      exam_date: formValue.info.exam_date,
      exam_time: formValue.info.exam_time,
      duration_minutes: formValue.info.duration_minutes,
      price: formValue.info.price,
      max_students: formValue.info.max_students,
      registration_deadline: formValue.info.registration_deadline,
      questions: formattedSections
    };

    Swal.fire({
      title: this.editExamId ? 'جاري تحديث الاختبار...' : 'جاري إنشاء الاختبار...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const request$ = this.editExamId 
      ? this.examService.updateExam(this.editExamId, payload)
      : this.examService.createExam(payload);

    request$.subscribe({
      next: (res) => {
        // Find if listening section has an audio file
        const listeningSection = this.sections.controls.find(s => s.get('section_type')?.value === 'listening');
        const audioFile = listeningSection?.get('audio_file')?.value;
        const examId = res?.data?.id || res?.id;

        if (examId && audioFile) {
          Swal.fire({
            title: 'جاري رفع الملف الصوتي...',
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            }
          });

          this.examService.uploadAudio(examId, audioFile).subscribe({
            next: () => {
              Swal.fire({
                icon: 'success',
                title: 'تم بنجاح',
                text: 'تم إنشاء الاختبار ورفع الملف الصوتي بنجاح',
                confirmButtonText: 'حسناً'
              }).then(() => {
                this.close.emit(true);
              });
            },
            error: (err) => {
              console.error('Audio upload error:', err);
              Swal.fire({
                icon: 'warning',
                title: 'اكتمل جزئياً',
                text: 'تم الحفظ بنجاح ولكن فشل رفع الملف الصوتي. يرجى المحاولة لاحقاً',
                confirmButtonText: 'حسناً'
              }).then(() => {
                this.close.emit(true);
              });
            }
          });
        } else {
          Swal.fire({
            icon: 'success',
            title: 'تم بنجاح',
            text: 'تم إنشاء الاختبار بنجاح',
            confirmButtonText: 'حسناً'
          }).then(() => {
            this.close.emit(true);
          });
        }
      },
      error: (err) => {
        console.error('Submit error:', err);
        let errorMsg = err.error?.message || 'حدث خطأ أثناء محاولة إنشاء الاختبار';
        
        // Show specific backend validation errors if present
        if (err.error?.errors) {
          const detail = Object.entries(err.error.errors)
            .map(([key, msgs]: [string, any]) => `${key}: ${msgs.join(', ')}`)
            .join('\n');
          errorMsg += '\n\n' + detail;
        }

        Swal.fire({
          icon: 'error',
          title: 'فشل العملية',
          text: errorMsg,
          confirmButtonText: 'حسناً'
        });
      }
    });
  }

  cancel() {
    this.close.emit(false);
  }
}
