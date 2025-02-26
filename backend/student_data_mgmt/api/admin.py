from django.contrib import admin
from .models import Student, StudentMarks
# Register your models here.

class studentAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'roll', 'address', 'student_class','section', 'photo']
            
admin.site.register(Student, studentAdmin)
admin.site.register(StudentMarks)