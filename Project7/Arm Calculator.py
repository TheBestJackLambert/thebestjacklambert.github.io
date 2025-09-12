#factorial function
def fac(x):
  y = 1
  for i in range(1, x+1):
    y *= i
  return y

#cosine function
def cos(x):
    y = 0
    for i in range(500):
      y += 1/(fac(2*i)) * x ** (2*i) * (-1)**i
    return y

#sine function
def sin(x):
    y = 0
    for i in range(250):
      y += 1/(fac(1 + 2*i)) * x ** (2*i + 1) * (-1)**i
    return y

#arctangent funciton
def arctan(k, z):
    x = z/k
    y = 0
    for i in range(250):
      y +=  1/(2 * i + 1) * x ** (2 * i + 1) * (-1) ** i
    return y

#approximates pi
pi = 0
for i in range(500):
  pi += 4/(1 + 2*i) * (-1)**i

#converts radians to degrees
def rad(x):
  x *= 180/pi
  return x

#multiplies the matricies
def multiplyMatrix(a, b):
    k = []
    for i in range(3):
        row = []
        for j in range(3):
            p = 0
            for l in range(3):
                p += a[i][l] * b[l][j]
            row.append(p)
        k.append(row)
    return k

#does the complicated arm thingies
def thing():

    #identity matrix
    zorp = [[1, 0, 0],
            [0, 1, 0],
            [0, 0, 1]]
    for i in range(joints):

        #identity matrix
        forp = [[1, 0, 0],
                [0, 1, 0],
                [0, 0, 1]]

        #turns identity matrix into matrix containing angle information
        forp[0][0] = cos(aa[i])
        forp[0][1] = -1 * sin(aa[i])
        forp[1][0] = sin(aa[i])
        forp[1][1] = cos(aa[i])

        #applies angle transformation to our matrix
        zorp = multiplyMatrix(zorp, forp)

        #identity matrix
        gorp = [[1, 0, 0],
                [0, 1, 0],
                [0, 0, 1]]

        #adds length information
        gorp[0][2] = ll[i]

        #applies length transofrmation to our matrix
        zorp = multiplyMatrix(zorp, gorp)
    return zorp


#rounds matricies for easier reading
def roundMatrix(matrix):
  for i in range(3):
    for j in range(3):
      matrix[i][j] = round(matrix[i][j], 3)
  return matrix

#gathers joint information
joints = int(input('How many joints?'))

#creates empty lists
aa = []
ll = []

#gathers angles and lengths
for i in range(joints):
    aa.append(pi * (1 / 180) * float(input(f'What angle do you want for angle {i + 1}? ')))
for i in range(joints):
    ll.append(float(input(f'What length do you want for length {i + 1}? ')))

#prints final matrix
blorp = roundMatrix(thing())
for row in blorp:
  print(row)

#prints coordinatoes and orientation using arctan function
print('x:'+ str(blorp[0][2]))
print('y:'+ str(blorp[1][2]))
print('Angle:'+str(round(rad(arctan(blorp[0][0], blorp[1][0])),3)))

