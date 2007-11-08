
package chickenfoot.experimental;


/**
 * StringMetrics is a utility class for Strings.
 *
 * @author mbolin
 */
public class StringMetrics {

    private StringMetrics() {}
    
    public static int editDistance(String s1, String s2) {
        String pattern = null;
        String text = null;
        if (s1.length() > s2.length()) {
          text = s1;
          pattern = s2;
        } else {
          text = s2;
          pattern = s1;
        }

        text = text.trim().toLowerCase().replaceAll("[\\W_]+", " ");
        pattern = pattern.trim().toLowerCase().replaceAll("[\\W_]+", " ");  
        
        int patLen = pattern.length() + 1;
        int[] col = new int[patLen];
        int[] newCol = new int[patLen];
        for (int i = 0; i < patLen; i++) col[i] = i;
        int txtLen = text.length();  
        int distance = col[pattern.length()];  
        for (int j = 0; j < txtLen; j++) {
          newCol[0] = 0;
          for (int i = 1; i < patLen; i++) {
            if (pattern.charAt(i - 1) == text.charAt(j)) {
              newCol[i] = col[i - 1];
            } else {
              newCol[i] = 1 +
               Math.min(newCol[i - 1], Math.min(col[i], col[i - 1]));
            }
          }
          if (newCol[pattern.length()] < distance) {
              distance = newCol[pattern.length()];
          }          
          int[] swap = col;
          col = newCol;
          newCol = swap;
        }
        return distance;        
    }
}
