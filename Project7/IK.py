#factorial function
def fac(x):
  y = 1
  for i in range(1, x+1):
    y *= i
  return y

#cosine function
def cos(x):
    y = 0
    for i in range(25):
      y += 1/(fac(2*i)) * x ** (2*i) * (-1)**i
    return y

#sine function
def sin(x):
    y = 0
    for i in range(25):
      y += 1/(fac(1 + 2*i)) * x ** (2*i + 1) * (-1)**i
    return y

#tan function
def tan(x):
  y = sin(x)/cos(x)
  return y

#arccos function
def arccos(x, y):
  b = abs((x**2-y**2))**.5/y
  c = arctan(y, b)
  return c

#arctan function
def arctan(x, y):

    #if denominator is zero returns corresponding angle
    if x == 0:
        if y > 0: return (pi/2)
        if y < 0: return (-pi/2)
        return 0.0
    u = y / x

    #determines sign of angle
    sgn = 1.0 if u >= 0 else -1.0
    t = abs(u)
    inv = False

    #if y>x flips it or easier compute and signals for unflip later on
    if t > 1.0:
        inv = True
        t = 1.0 / t
    a = 0.0

    #does taylor series 20 times
    for i in range(20):
        a += ((-1)**i) * (t**(2*i + 1)) / (2*i + 1)

    #adjusts for sign
    a = sgn * ( (pi/2) - a ) if inv else sgn * a

    #puts in correct quadrant
    if x < 0 and y >= 0: a += pi
    elif x < 0 and y < 0: a -= pi
    return a


#approximates pi
pi = 0
for i in range(15000):
  pi += 4/(1 + 2*i) * (-1)**i

#converts radians to degrees
def rad(x):
  x *= 180/pi
  return x

#converts degrees to radians
def deg(x):
  x *= pi/180
  return x

#inds closest value to v in a list
def cv(l, v):
  for i in l:
    i = abs(i-v)
  return min(l)

#empty length list and dummy variables
ll = []
b = 0
joints = int(input("How many joints do you want?"))

#get's length information and finds sum of lengths
for i in range(joints):
  ll.append(float(input(f'What length do you want for length {i + 1}? ')))
for i in ll:
  b += abs(i)

#determines lower limit
k = max(ll)
blorple = b - k
if blorple >= k:
  shlorb = 0
else:
  shlorb = k - blorple

#gathers coordinates and orientation
x = float(input('what x value'))
y = float(input('what y value'))

#defines angle list
aa = []
for i in range(joints):
  aa.append(0)

#finds distance of coordinates from origin
big = (x ** 2 + y ** 2)**.5
#determines whether it's possible or not
if big > b or shlorb > big:
  print('n/a')

#does everything else
else:
  blorb = arctan(x, y)
  glorbulation = 0
  d = 1
  while glorbulation < 2500000 and d > .001:
    for i in range(len(aa)-1, -1, -1):
      rx = 0
      ry = 0
      mx = 0
      my = 0
      theta = 0
      beta = 0
      for j in range(i):
        theta += aa[j]
        rx += ll[j] * cos(theta)
        ry += ll[j] * sin(theta)
      shorb = arctan(x - rx, y - ry)
      for h in range(i, len(aa), 1):
        theta += aa[h]
        mx += ll[h] * cos(theta)
        my += ll[h] * sin(theta)
      mlorble = arctan(mx, my)
      if abs(mlorble - shorb) > .0001:
        if shorb > mlorble:
          aa[i] += .00005
        elif mlorble > shorb:
          aa[i] -= .00005

    ex = ey = 0.0
    theta = 0.0
    for k in range(len(aa)):
        theta += aa[k]
        ex += ll[k] * cos(theta)
        ey += ll[k] * sin(theta)

    d = ((x - ex)**2 + (y - ey)**2)**0.5
    glorbulation += 1


  blorbx = 0
  blorby = 0
  theta = 0
  for i in range(len(aa)):
    theta += aa[i]
    blorbx += ll[i] * cos(theta)
    blorby += ll[i] * sin(theta)
  print('x: ' +str(round(blorbx, 2)))
  print('y: ' +str(round(blorby, 2)))

  #prints angles
  print('Angles in degrees')
  for i in range(len(aa)):
    print('q' +str(int(i+1)) +': ' +str(round(rad(aa[i]), 3)))

#inds closest value to v in a list
def cv(l, v):
  for i in range(len(l)):
    l[i] = abs(l[i]-v)
  return min(l) + v

ll = [1,2,3,4,5,6,7,8]
shlorb = cv(ll, 4.4)

print(shlorb)

