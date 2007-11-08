
/**
 * Take two nodes and figure out how far
 * each is from its least common ancestor
 */
function nodeDistance(n1, n2) {
  n1set = new SlickSet();
  n2set = new SlickSet();
  n1set.add(n1);
  n2set.add(n2);
  while (n1 || n2) {
    if (n1set.contains(n2)) break;
    if (n2set.contains(n1)) break;
    n1 = (n1) ? n1.parentNode : n1;
    n2 = (n2) ? n2.parentNode : n2;
    if (n1) n1set.add(n1);
    if (n2) n2set.add(n2);
  }
  score = n1set.size() + n2set.size();
  n1set.clear();
  n2set.clear();
  return score;
}