from flask import Flask, render_template
import pandas as pd

app = Flask(__name__)

dat = {
    'Радиальные, осевые и крышные вентиляторы': [
        'Радиальные вентиляторы среднее давления',
        'Радиальные вентиляторы низкого давления',
        'Крышные вентиляторы',
        'Осевые вентиляторы',
    ],
    'Канальные вентиляторы': [
        'Прямоугольные канальные вентиляторы',
        'Круглые канальные вентиляторы',
        'Крышные вентиляторы с малым расходом воздуха',
        'Осевые вентиляторы'
    ],
    'Глушители': [
        'Круглые трубчатые',
        'Прямоугольные трубчатые',
        'Прямоугольные пластинчатые'
    ]
}

df = pd.read_excel('data/price_list.xlsx')


@app.route('/')
def combo1():  # put application's code here
    # data = [x for x in dat]
    data = df['Раздел'].unique()
    return render_template('index.html', data=data)


@app.route('/extend/<string:num>', methods=['POST'])
def combo2(num):  # put application's code here
    # print(num, type(num))
    # data = dat[num]
    data = df[df['Раздел'] == num]['Оборудование'].tolist()
    print(data)
    return data


if __name__ == '__main__':
    app.run(debug=True)
