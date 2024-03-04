from django import forms
from .models import MyModel

class MyModelForm(forms.ModelForm):
    class Meta:
        model = MyModel
        fields = ['my_checkbox']
        widgets = {
            'my_checkbox': forms.CheckboxInput(),
        }