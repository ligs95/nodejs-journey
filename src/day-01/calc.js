const args = process.argv.slice(2);
const operation = args[0];
const num1 = Number(args[1]);
const num2 = Number(args[2]);

let result;
switch (operation) {
    case 'add':
        result = num1 + num2;
        break;
    case 'subtract':
        result = num1 - num2;
        break;
    case 'multiply':
        result = num1 * num2;
        break;
    case 'divide':
        if(num2 === 0) {
            console.error('除数不能为零！')
            process.exit(1)
        }
        result = num1 / num2;
        break
    default:
        console.log('未知操作，可用: add | subtract | multiply | divide');
        process.exit(1);
}

console.log(result);