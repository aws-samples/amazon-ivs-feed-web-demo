/**
 * A doubly-linked Node containing 3 fields:
 *
 * data - data contents
 * next - pointer/reference to the next node in the Linked List
 * prev - pointer/reference to the prev node in the Linked List
 */
class Node {
  /**
   * Constructor
   * @param {*} data the data to store inside a Node
   */
  constructor(data) {
    this.data = data;
    this.next = null; // pointer to the next node
    this.prev = null; // pointer to the prev node
  }
}

/**
 * A Circular Doubly Linked List
 * https://en.wikipedia.org/wiki/Doubly_linked_list#Circular_doubly_linked_lists
 */
export default class CircularLinkedList {
  compare = (node_a, node_b) => node_a.data === node_b.data; // default compare function

  /**
   * Constructor
   * @param {Array} [initData] array of node data to insert into the linked list on initialization
   * @param {Function} [compare] a function that takes 2 Node data objects as args and returns true
   *                             if the corresponding Nodes are considered equal; false otherwise
   */
  constructor(initData, compare = this.compare) {
    this.compare = (a, b) => compare(a.data, b.data);
    this.head = undefined;
    this.size = 0;

    if (initData) {
      if (Array.isArray(initData)) {
        this._init(initData);
      } else {
        console.warn('Invalid initializer list');
      }
    }
  }

  /**
   * (PRIVATE - internal use only)
   *
   * For each element in 'dataList,' inserts a Node into the Linked List
   * created with the element as its data contents
   * @param {Array} dataList array containing the data contents for each new Node
   */
  _init(dataList) {
    dataList.forEach((data) => this.insert(data));
  }

  /**
   * Creates a Node with the specified data and inserts it into the Linked List.
   * If afterData is provided, then the new Node is inserted after the Node whose
   * data contents match 'afterData'; otherwise, the new Node is inserted at the end
   * of the list by default
   * @param {Node.data} data data contents of the new Node
   * @param {Node.data} afterData data contents of the Node after which to insert the new Node
   * @returns the inserted Node
   */
  insert(data, afterData) {
    const newNode = new Node(data);

    if (!this.size) {
      newNode.next = newNode.prev = newNode;
      this.head = newNode;
      this.size++;
      return newNode;
    }

    const afterNode = afterData ? this.get(afterData) : this.head.prev;

    if (!afterNode) return;

    newNode.next = afterNode.next;
    newNode.prev = afterNode;

    afterNode.next.prev = newNode;
    afterNode.next = newNode;

    this.size++;

    return newNode;
  }

  /**
   * Removes the Node whose data contents match 'data', if it exists.
   * If the head Node is removed, then this.head is pointed to undefined.
   * @param {*} data the data used to find the Node to remove
   * @returns the removed Node
   */
  remove(data) {
    const nodeToRemove = this.get(data);

    if (!nodeToRemove) return;

    if (this.compare(nodeToRemove.next, nodeToRemove)) {
      this.head = undefined;
    } else {
      nodeToRemove.next.prev = nodeToRemove.prev;
      nodeToRemove.prev.next = nodeToRemove.next;
    }

    if (this.compare(this.head, nodeToRemove)) {
      this.head = nodeToRemove.next;
    }

    nodeToRemove.next = nodeToRemove.prev = null;
    this.size--;

    return nodeToRemove.data;
  }

  /**
   * Finds the Node whose data contents match 'data' and returns it,
   * if it exists.
   * @param {Node.data} data data used to find the Node
   * @returns the retrieved Node
   */
  get(data) {
    if (!this.size) {
      console.warn('Get: Linked List is empty!');
      return;
    }

    let currentNode = this.head;
    do {
      if (this.compare(new Node(data), currentNode)) {
        return currentNode;
      }
      currentNode = currentNode.next;
    } while (!this.compare(currentNode, this.head));

    console.warn('Get: No matching Node exists in the Linked List!');
  }

  /**
   * Update the data contents to 'newData' for the Node whose current data contents
   * match 'origData', if it exists
   * @param {Node.data} origData data used to find the Node to update
   * @param {Node.data} newData new data to replace the existing data (origData) of the Node to update
   * @returns the updated Node
   */
  set(origData, newData) {
    if (!this.size) {
      console.warn('Set: Linked List is empty!');
      return;
    }

    const nodeToUpdate = this.get(origData);

    if (!nodeToUpdate) return;

    nodeToUpdate.data = newData;

    return nodeToUpdate;
  }
}
