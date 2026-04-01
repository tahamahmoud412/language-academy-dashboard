import { Component, input, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-section-questions-step',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './section-questions-step.html',
  styleUrl: './section-questions-step.css'
})
export class SectionQuestionsStepComponent {
  private fb = inject(FormBuilder);
  
  sectionForm = input.required<FormGroup>();
  title = input.required<string>();
  deleteExistingAudio = output<number>();

  get questions() {
    return this.sectionForm().get('questions') as FormArray;
  }

  addQuestion() {
    const questionGroup = this.fb.group({
      question_id: [this.questions.length + 1],
      question_text: ['', Validators.required],
      options: this.fb.group({
        A: ['', Validators.required],
        B: ['', Validators.required],
        C: ['', Validators.required],
        D: ['', Validators.required]
      }),
      correct_answer: ['', Validators.required],
      points: [1, [Validators.required, Validators.min(0.5)]]
    });
    this.questions.push(questionGroup);
  }

  removeQuestion(index: number) {
    Swal.fire({
      title: 'هل أنت متأكد؟',
      text: 'سيتم حذف هذا السؤال بشكل كامل',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'نعم، احذف',
      cancelButtonText: 'إلغاء'
    }).then((result) => {
      if (result.isConfirmed) {
        this.questions.removeAt(index);
      }
    });
  }

  onAudioUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.match('audio.*')) {
        Swal.fire('خطأ', 'يرجى رفع ملف صوتي صالح (mp3, wav)', 'error');
        return;
      }
      this.sectionForm().patchValue({ audio_file: file });
      Swal.fire({
        title: 'تم الرفع', 
        text: `تم إرفاق الملف: ${file.name}`, 
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    }
  }

  removeAudio() {
    this.sectionForm().patchValue({ audio_file: null });
    // Reset the file input element so the same file can be selected again
    const input = document.getElementById('audioUpload') as HTMLInputElement;
    if (input) input.value = '';
  }

  removeExistingAudio() {
    const audioObj = this.sectionForm().get('existing_audio')?.value;
    if (audioObj && (audioObj.id || audioObj.audio_id)) {
      this.deleteExistingAudio.emit(audioObj.id || audioObj.audio_id);
    }
  }

  isInvalid(control: any): boolean {
    return !!control && control.invalid && (control.dirty || control.touched);
  }
}
