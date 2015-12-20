import os, sys

files = []

files.extend([
    './src/nerdy.js',
    './src/hclust.js',
    './src/kmeans.js',
    './src/knn.js',
    './src/linreg.js',
    './src/logreg.js',
    './src/nbayes.js',
    './src/neural.js',
    './src/pca.js',
    './src/svm.js'
])

if '-docs' in sys.argv:
    files = ' '.join('"' + x + '"' for x in files)
    outfile = '-d "./docs"'
    os.system('build\\jsdoc\\jsdoc ' + files + ' "README.md" ' + outfile)
else:
    files = ' '.join('--js ' + x for x in files)
    outfile = ' --js_output_file nerdy.min.js'
    os.system('java -jar build\\compiler.jar ' + files + outfile)

