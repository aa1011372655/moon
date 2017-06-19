function Node(val) {
    this.value = val;
    this.left = this.right = null;
}
function BST() {
    this.root = null;
}
BST.prototype.insert = function (val) {
    var node = new Node(val);
    if (this.root == null) {
        this.root = node;
    } else {
        var current = this.root;
        while (current) {
            if (current.value > val) {
                if (current.left === null) {
                    current.left = node;
                    break;
                }
                current = current.left;
            } else {
                if (current.right === null) {
                    current.right = node;
                    break;
                }
                current = current.right;
            }
        }
    }
};
BST.prototype.show = function (node) {
    var current = node || this.root;
    console.log(current.value);
    if (current.left) {
        this.show(current.left)
    }
    if (current.right) {
        this.show(current.right)
    }
};
BST.prototype.showMin = function (node) {
    var current = node || this.root;
    if (current.left) {
        this.showMin(current.left)
    }else{
        console.log(current.value)
    }
};
BST.prototype.showMax = function (node) {
    var current = node || this.root;
    if (current.right) {
        this.showMax(current.right)
    }else{
        console.log(current.value)
    }
};


var bst = new BST();
bst.insert(5);
bst.insert(3);
bst.insert(7);
bst.insert(2);
bst.insert(4);
bst.insert(6);
bst.insert(10);
bst.insert(20);
bst.show();
bst.showMin();
bst.showMax();
