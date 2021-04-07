
from django.shortcuts import render, redirect

def loginPage(request):
    if request.user.is_authenticated:
        # UserModel.objects.filter(user=request.user)
        return redirect('homepage')
        # print("yes")
    else:
        # print("no")
        return redirect('notLoggedIn')


