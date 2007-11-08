package chickenfoot.experimental;

import java.util.Random;

import netscape.javascript.JSObject;

/**
 * <code>LiveConnectBenchmarking</code> is a test to measure how much overhead
 * calling a method from Java adds.
 * 
 * @author mbolin
 */
public class LiveConnectBenchmarking {

    private JSObject jsobj;
    
    private String word;

    private Random random = new Random();
    
    /**
     * If no arguments are passed, then this will time how long it takes to call
     * doNextToNothing() 10000 times.
     * 
     * If an argument is passed, then it should be an integer, and that will be
     * the length of the String that is passed to setWords() 100 times.
     * 
     */
    public static void main(String[] argv) throws Exception {

        LiveConnectBenchmarking bean = new LiveConnectBenchmarking();
        if (argv.length > 0) {
            try {
                int n = Integer.parseInt(argv[0]);
                String str = "";
                for (int i = 0; i < n; i++)
                    str += "a";

                long start = System.currentTimeMillis();
                for (int j = 0; j < 100; j++) {
                    bean.setWord(str);
                }
                long end = System.currentTimeMillis();
                System.out.println(end - start);

                return;
            } catch (NumberFormatException ex) {
                /*
                System.out.println("Testing Amazon");
                String xhtml = TestUtils.getFileAsString("amazon-profile-example.html");

                // this is just to get lapis running past the exception
                MozillaDocumentBroker tempBroker = MozillaDocumentBroker.createMozillaDocumentBroker(xhtml);
                tempBroker.findAll("link");
                
                System.out.println(xhtml.length());
                long start = System.currentTimeMillis();
                MozillaDocumentBroker broker = MozillaDocumentBroker.createMozillaDocumentBroker(xhtml);
                broker.findAll("link");
                long end = System.currentTimeMillis();
                System.out.println(end - start);
                return;
                */
            }
        }

        long start = System.currentTimeMillis();
        for (int i = 0; i < 100000; i++) {
            // bean.doNothing();
            bean.doNextToNothing();
        }
        long end = System.currentTimeMillis();
        System.out.println(end - start);

        System.out.println(bean.getTime());
    }

    public void doNothing() {
        // deliberately empty method
        // may be inlined away?
    }

    public void doNextToNothing() {
        random.nextInt();
    }

    public void setWord(String word) {
        this.word = word;
        // System.out.println("the words are: " + words);
    }

    public String getDoubleWord() {
        return word + word;
    }

    public long getTime() {
        return System.currentTimeMillis();
    }
}
