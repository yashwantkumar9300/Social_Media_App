from django import forms
from django.contrib.auth.models import User
from SM_Users.models import UserModel


class UserRegistrationForm(forms.ModelForm):
    username=forms.CharField(label="Mobile No",widget=forms.NumberInput(attrs={'pattern':"^[6-9]\d{9}$",'class':"form-control"}))
    password=forms.CharField(widget=forms.PasswordInput(attrs={"pattern":"(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}","title":"Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters",'class':"form-control"}))
    email=forms.CharField(widget=forms.EmailInput(attrs={'class':"form-control"}))
    fname=forms.CharField(label="First Name",widget=forms.TextInput(attrs={'pattern':'[a-zA-Z\s]+','class':"form-control"}))
    lname=forms.CharField(label="Last Name",widget=forms.TextInput(attrs={'pattern':'[a-zA-Z\s]+','class':"form-control"}))
    class Meta:
        fields=['fname','lname','username','email','password']
        model = UserModel

    def clean_username(self):
        uname=self.cleaned_data['username']
        try:
            us=User.objects.get(username=uname)
            if us:
                raise forms.ValidationError("Username Already Exist.")
        except User.DoesNotExist:
            return uname




