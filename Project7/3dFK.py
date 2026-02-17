iterations = 10
pi = 3.1415926535897932384626433832795
angles = []
axis = []
lengths = []
k = int(input('How many?'))
for i in range(k):
	angles.append(float(input('angle'))*pi/180)
for i in range(k):
	axis.append(input('axis'))
for i in range(k):
	lengths.append(float(input('length')))

def fac(p):
	return 1 if (p == 0) or (p == 1) else p * fac(p-1)

def wrap(x):
	x = x % (2 * pi)
	return x

def sin(x):
	x = wrap(x)
	approximation = 0
	for i in range(iterations):
		approximation += ((-1)**i) * (x**(2*i + 1)) / fac((2*i + 1))
	return approximation


def cos(x):
	x = wrap(x)
	approximation = 0
	for i in range(iterations):
		approximation += ((-1)**i) * (x**(2*i)) / fac(2*i)
	return approximation

def mm(a, b):
	c = []
	for i in range(len(a)):
		row = []
		for k in range(len(b)):
			z = 0
			for j in range(len(b[i])):
				z += a[i][j]*b[j][k]
			row.append(z)
		c.append(row)
	return c

def createMatrixForJointAndLinkButImNotSureIfItWorksAlsoRightNowItIsJustRotation(angle, axis, length,):
	if axis == "x":
		matrix = [[1, 0, 0, 0],
		          [0, cos(angle), -sin(angle), 0],
		          [0, sin(angle), cos(angle), 0],
		          [0, 0, 0, 1]]
	if axis == "y":
		matrix = [[cos(angle), 0, sin(angle), 0],
		          [0, 1, 0, 0],
		          [-sin(angle), 0, cos(angle), 0],
		          [0, 0, 0, 1]]
	if axis == "z":
		matrix = [[cos(angle), -sin(angle), 0, 0],
		          [sin(angle), cos(angle), 0, 0],
		          [0, 0, 1, 0],
		          [0, 0, 0, 1]]
	atrix = [[1,0,0,length],
						[0,1,0,0],
				  	[0,0,1,0],
				  	[0,0,0,1]]
	matrix = mm(matrix, atrix)
	return matrix

final = createMatrixForJointAndLinkButImNotSureIfItWorksAlsoRightNowItIsJustRotation(angles[0],axis[0],lengths[0])
for i in range(len(lengths)-1):
	final = mm(final, createMatrixForJointAndLinkButImNotSureIfItWorksAlsoRightNowItIsJustRotation(angles[i+1],axis[i+1],lengths[i+1]))

print(final)
print(final[1][3])
print(final[2][3])

def mm(a, b):
	c = []
	for i in range(len(a)):
		row = []
		for k in range(len(b)):
			z = 0
			for j in range(len(b[i])):
				z += a[i][j]*b[j][i]
			row.append(z)
		c.append(row)
	return c
A = [[1,2,3],[4,5,6]]
B = [[7,8],[9,10],[11,12]]
print(mm(A, B))